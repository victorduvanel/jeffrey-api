import _                        from 'lodash';
import Promise                  from 'bluebird';
import request                  from 'request-promise';
import bookshelf                from '../services/bookshelf';
import knex                     from '../services/knex';
import { render}                from '../services/handlebars';
import Mission, { SERVICE_FEE } from '../models/mission';

export const processPayout = async () => {
  const missionIds = await knex
    .raw(
      `update missions
       set
         pay_tentative_at = NOW() + interval '24 hours',
         updated_at = NOW()
       where
         paid_at IS NULL AND
         pay_tentative_at <= NOW()
       returning id
      `
    )
    .then(res => res.rows)
    .then(missions => missions.map(mission => mission.id));

  if (!missionIds.length) {
    return 'nothing';
  }

  const missions = await Promise.map(missionIds, async (missionId) => {
    let mission;

    try {
      mission = await Mission.find(missionId);

      if (!mission) {
        return {
          id: missionId,
          totalCost: 0,
          providerGain: 0,
          paymentSucceeded: false,
          error: 'Mission not found',
        };
      }

      const totalCost = await mission.charge();

      return {
        id: mission.id,
        totalCost: totalCost / 100,
        providerGain: mission.providerGain() / 100,
        currency: mission.get('priceCurrency'),
        paymentSucceeded: true
      };
    } catch (err) {
      console.log(err);

      const errorMessage = [];

      if (err.code) {
        errorMessage.push(err.code);
      }

      if (err.message) {
        errorMessage.push(err.message);
      }

      if (!errorMessage.length) {
        errorMessage.push('Unknow error');
      }

      return {
        id: mission.id,
        totalCost: mission.totalCost() / 100,
        providerGain: mission.providerGain() / 100,
        currency: mission.get('priceCurrency'),
        paymentSucceeded: false,
        error: errorMessage.join(' ')
      };
    }
  });

  const html = await render('html/payout-report', {
    missions
  });

  return html;
};

export const sendPayoutAlert = async () => {
  const missionIds = await knex
    .select('id')
    .from('missions')
    .whereRaw('pay_tentative_at < NOW() + interval \'24 hours\'')
    .whereNull('paid_at')
    .then(missions => missions.map(mission => `'${mission.id}'`).join());

  if (!missionIds) {
    return 'nothing';
  }

  const res = await bookshelf.knex
    .raw(
      `select
         NOW() as "now",
         ( select count(*) from missions )::integer as "total",
         max(clients.count)::float as "client_max",
         avg(clients.count)::float as "client_avg",
         max(providers.count)::float as "provider_max",
         avg(providers.count)::float as "provider_avg"
       from
         (
           select count(*)
           from missions
           where id in (${missionIds})
           group by client_id
         ) as clients,
         (
           select count(*)
           from missions
           where id in (${missionIds})
           group by provider_id
         ) as providers
      `
    );

  const globalStats = res.rows[0];

  const currencyStats = await knex
    .raw(
      `select
         price_currency as currency,
         max(price)::float / 100 as "max",
         min(price)::float / 100 as "min"
       from
       missions
       where id in (${missionIds})
       group by price_currency
      `
    )
    .then(res => res.rows);

  const currencies = await knex
    .select('price_currency as currency')
    .from('missions')
    .groupBy('price_currency')
    .whereRaw(`id in (${missionIds})`)
    .then(rows =>  rows.map(row => row.currency));

  const currencyTotals = {};

  const missionsStats = await Promise.map(currencies, currency => bookshelf.knex
    .raw(
      `select
         missions.id,
         CONCAT(providers.first_name, ' ', providers.last_name) as "provider",
         CONCAT(clients.first_name, ' ', clients.last_name) as "client",
         extract(epoch from (missions.ended_date - missions.started_date)) as "length",
         missions.price,
         missions.price_currency,
         missions.started_date,
         missions.ended_date
       from missions
       left join users as providers on missions.provider_id = providers.id
       left join users as clients on missions.client_id = clients.id
       where
         price_currency = :currency
       and
         missions.id in (${missionIds})
      `,
      { currency }
    )
    .then(res => {
      const rows = res.rows.map(row => {
        return {
          ...row,
          length: row.length * 1000,
          price: row.price / 100,
          totalCost: Mission.computeMissionTotalCost(row.started_date, row.ended_date, row.price) / 100
        };
      });

      const total = rows.reduce((total, mission) => total + mission.totalCost, 0);

      currencyTotals[currency] = total;

      return {
        currency,
        rows
      };
    })
  );

  const currencyRates = await request('http://data.fixer.io/api/latest?access_key=912a4d94343fa4e5df3bba6eb2d606c1')
    .then(r => JSON.parse(r));

  const worldwideStats = {
    currency: currencyRates.base,
    total: 0,
    grossIncome: 0
  };

  _.forEach(currencyTotals, (total, currency) => {
    worldwideStats.total += total * currencyRates.rates[currency];
    worldwideStats.grossIncome += total * SERVICE_FEE * currencyRates.rates[currency];
  });

  const html = await render('html/payout-alert', {
    currencyStats: currencyStats.map(stat => ({
      ...stat,
      total: currencyTotals[stat.currency],
      grossIncome: currencyTotals[stat.currency] * SERVICE_FEE
    })),
    globalStats,
    missionsStats,
    worldwideStats
  });

  return html;
};
