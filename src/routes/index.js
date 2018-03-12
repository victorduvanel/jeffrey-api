import * as oauth           from './oauth';
import * as me              from './me';
import * as signup          from './signup';
import * as activate        from './activate';
import * as paymentMethods  from './payment-methods';
import * as messages        from './messages';
import * as invoices        from './invoices';
import * as resetPassword   from './reset-password';
import * as ms              from './ms';
import * as fixtureMessages from './fixture-messages';
import * as apple           from './apple';
import * as appLink         from './app-link';
import * as appRedirect     from './app-redirect';
import * as contactDetails  from './contact-details';
import * as profilePic      from './profile-pic';

export default {
  oauth, me, activate, signup,
  paymentMethods, messages, invoices,
  resetPassword, ms,
  fixtureMessages, apple, appLink,
  appRedirect, contactDetails,
  profilePic
};
