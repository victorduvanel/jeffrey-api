import Promise from 'bluebird';
import request from 'request-promise';

export function isLocal(ip) {
  if (ip.indexOf('::ffff:') === 0) {
    ip = ip.substr('::ffff:'.length);
  }

  if (ip === '127.0.0.1') {
    return true;
  }

  if (ip.indexOf('10.') === 0) {
    return true;
  }

  if (ip.indexOf('192.168.') === 0) {
    return true;
  }

  if (ip.indexOf('172.') === 0) {
    ip = ip.split('.');

    const s = parseInt(ip[1], 10);
    if (s >= 16 && s <= 31) {
      return true;
    }
    return false;
  }

  if (ip === '::1') {
    return true;
  }

  return false;
}

export function address(ip) {
  if (isLocal(ip)) {
    return request('https://api.ipify.org');
  } else {
    return Promise.resolve(ip);
  }
}
