import blackList from './black-list';

export const sanitize = (email) => {
  return email.toLowerCase().trim();
};

export const isValid = (email) => {
  email = sanitize(email);

  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

export const isBlackListed = (email) => {
  email = sanitize(email);

  if (!isValid(email)) {
    return false;
  }

  const domain = email.substr(email.lastIndexOf('@') + 1);

  return blackList.indexOf(domain) !== -1;
};
