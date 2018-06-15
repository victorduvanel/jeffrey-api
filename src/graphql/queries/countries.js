import { registerQuery }  from '../registry';
import Country            from '../../models/country';

const activeCountriesDefinition = 'activeCountries: [Country]';
const getActiveCountries = async () => {
  const countries = await Country
    .query((query) => {
      query.where('is_enabled', '=', true);
    })
    .fetchAll();

  return countries
    .toArray()
    .map(country => country.serialize());
};

const allCountriesDefinition = 'allCountries: [Country]';
const getAllCountries = async () => {
  const countries = await Country
    .fetchAll();

  return countries
    .toArray()
    .map(country => country.serialize());
};

registerQuery(activeCountriesDefinition, { activeCountries: getActiveCountries });
registerQuery(allCountriesDefinition, { allCountries: getAllCountries });
