import request from 'request-promise';
import config  from '../config';

const { host, projectID, accessToken, params } = config.phraseApp;

const basicOpt = {
  uri: '',
  qs: params,
  headers: {
    Authorization: `token ${accessToken}`
  }
};

export default async (locale, tag) => request(Object.assign(basicOpt, {
  uri: `${host}/projects/${projectID}/locales/${locale}/download`,
  qs: Object.assign(params, { tag })
}));
