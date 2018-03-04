import statusCodes from '../lib/net/http/status-code';
import leftPad     from 'left-pad';

const PROTOCOL = 0x01000000;
const OTHER    = 0x05000000;

const errorCode = (function*() {
  for (let code = 1;; ++code) {
    yield code;
  }
})();

export class APIError extends Error {
  constructor({ category, status, title }) {
    super();

    let c = leftPad((category | errorCode.next().value).toString(16), 8, 0);

    if (!status) {
      throw new Error('status must be set');
    }

    this.category = category;
    this.status   = status;
    this.title    = title;
    this.code     = c;
  }

  copy() {
    return new APIError({
      category: this.category,
      status  : this.status,
      title   : this.title
    });
  }

  detail(detail) {
    const err = this.copy();
    err.detail = detail;
    return err;
  }

  toJSON() {
    const rt = {
      code  : this.code.toString(16),
      title : this.title
    };

    if (this.detail) {
      rt.detail = this.detail;
    }

    return rt;
  }
}

export const BadRequest = new APIError({
  status   : statusCodes.badRequest,
  category : PROTOCOL,
  title    : 'Bad Request'
});

export const Unauthorized = new APIError({
  status   : statusCodes.unauthorized,
  category : PROTOCOL,
  title    : 'This resource requires authentication'
});

export const Forbidden = new APIError({
  status   : statusCodes.forbidden,
  category : PROTOCOL,
  title    : 'This resource requires authentication'
});

export const InternalServerError = new APIError ({
  status   : statusCodes.internalServerError,
  category : OTHER,
  title    : 'An internal server error occured'
});

export const InvalidParameterType = new APIError ({
  status   : statusCodes.badRequest,
  category : PROTOCOL,
  title    : 'Invalid Parameter Type'
});

export const MissingParameter = new APIError ({
  status   : statusCodes.badRequest,
  category : PROTOCOL,
  title    : 'A required paramater is missing'
});

export const UnexpectedParameter = new APIError ({
  status   : statusCodes.badRequest,
  category : PROTOCOL,
  title    : 'Unexpected Parameter'
});

export const NotFound = new APIError({
  status   : statusCodes.notFound,
  category : PROTOCOL,
  title    : 'Not found'
});

export const InvalidUserCredentials = new APIError ({
  status   : statusCodes.unauthorized,
  category : PROTOCOL,
  title    : 'Invalid Credentials'
});

export const EmailRejected = new APIError({
  status: statusCodes.badRequest,
  category: PROTOCOL,
  title: 'The e-mail address has been rejected by the system'
});
