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
import * as userDocuments   from './user-documents';
import * as graphiql        from './graphiql';
import * as userDevice      from './user-device';
import * as ping            from './ping';
import * as phoneNumber     from './phone-number';
import * as tos             from './tos';
import * as bankAccounts    from './bank-accounts';
import * as providers       from './providers';

export default {
  oauth, me, activate, signup,
  paymentMethods, messages, invoices,
  resetPassword, ms, tos,
  fixtureMessages, apple, appLink,
  appRedirect, contactDetails,
  profilePic, graphiql, userDocuments,
  userDevice, ping, phoneNumber,
  bankAccounts, providers
};
