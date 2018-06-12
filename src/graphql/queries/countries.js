import { registerQuery }  from '../registry';
import Country            from '../../models/country';

const def = 'allCountries: [Country]';

const getAllCountries = async () => {
  const countries = await Country.fetchAll();
  return countries
    .toArray()
    .map(country => country.serialize());
};

registerQuery(def, { allCountries: getAllCountries });
