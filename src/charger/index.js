import bookshelf from '../services/bookshelf';
import { render} from '../services/handlebars';
import Mission   from '../models/mission';

export const sendPayoutAlert = async () => {
  const res = await bookshelf.knex
    .raw(`
        select
          NOW() as "now",
          ( select count(*) from missions )::integer as "total",
          max(clients.count)::float as "client_max",
          avg(clients.count)::float as "client_avg",
          max(providers.count)::float as "provider_max",
          avg(providers.count)::float as "provider_avg"

        from
          (select count(*) from missions group by client_id) as clients,
          (select count(*) from missions group by provider_id) as providers
    `);

  const globalStats = res.rows[0];
  console.log(globalStats.now);

  const currencyStats = await bookshelf.knex
    .raw(`
        select
          price_currency,
          max(price)::float / 100 as "max",
          min(price)::float / 100 as "min",
          avg(price)::float / 100 as "avg",
          sum(price)::float / 100 as "sum",
          sum(price)::float / 100 as "gross_income"
        from
        missions
        group by price_currency
    `);

  const missionsStats = await bookshelf.knex
    .raw(`
      select
          missions.id,
          CONCAT(providers.first_name, ' ', providers.last_name) as "provider",
          CONCAT(clients.first_name, ' ', clients.last_name) as "client",
          (missions.ended_date - missions.started_date) as "length",
          missions.price, missions.price_currency,
          missions.started_date,
          missions.ended_date
        from missions
        left join users as providers on missions.provider_id = providers.id
        left join users as clients on missions.client_id = clients.id
        where price_currency = 'EUR'
    `);

  const html = await render('html/payout-alert', {
    currencyStats: currencyStats.rows,
    globalStats,
    missionsStats: missionsStats.rows.map(row => ({
      ...row,
      length: row.length.seconds * 1000 + row.length.milliseconds,
      price: row.price / 100,
      total_cost: Mission.computeMissionTotalCost(row.started_date, row.ended_date, row.price) / 100
    }))
  });

  return html;
};
