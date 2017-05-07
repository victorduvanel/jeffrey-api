import Promise from 'bluebird';
import express from 'express';
import { InternalServerError } from '../errors';

export const router = express.Router();

const wrapHandler = (handler) => {
  handler = Promise.method(handler);

  return (request, response, next) => {
    handler(request, response)
      .then(() => {
        response.end();
      })
      .catch((err) => {
        if (!err) {
          console.error('Handler thrown an undefined error');
          next(InternalServerError);
        } else {
          next(err);
        }
      });
  };
};

const addRoute = (method, pathname, handler) => {
  if (typeof handler === 'function') {
    handler = wrapHandler(handler);
    return router[method].call(router, pathname, handler);
  }

  const middlewares = handler;
  handler = wrapHandler(middlewares.pop());

  return router[method].call(router, pathname, ...middlewares, handler);
};

export const post = (pathname, handler) => {
  return addRoute('post', pathname, handler);
};

export const get = (pathname, handler) => {
  return addRoute('get', pathname, handler);
};

export const patch = (pathname, handler) => {
  return addRoute('patch', pathname, handler);
};

export const del = (pathname, handler) => {
  return addRoute('delete', pathname, handler);
};
