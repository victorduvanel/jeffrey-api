export function sanitize(email) {
  return email.toLowerCase().trim();
}

export function isValid(email) {
  email = sanitize(email);

  /* eslint-disable no-useless-escape */
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  /* eslint-enable no-useless-escape */
  return re.test(email);
}
