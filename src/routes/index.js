import * as oauth           from './oauth';
import * as me              from './me';
import * as signup          from './signup';
import * as activate        from './activate';
import * as paymentMethods  from './payment-methods';
import * as messages        from './messages';
import * as resetPassword   from './reset-password';
import * as ms              from './ms';
import * as fixtureMessages from './fixture-messages';
// import * as apple           from './apple';
// import * as appLink         from './app-link';
// import * as appRedirect     from './app-redirect';
import * as contactDetails  from './contact-details';
import * as profilePic      from './profile-pic';
import * as userDocuments   from './user-documents';
import * as userDevice      from './user-device';
// import * as ping            from './ping';
import * as phoneNumber     from './phone-number';
// import * as tos             from './tos';
// import * as bankAccounts    from './bank-accounts';
// import * as providers       from './providers';
import * as stripe          from './stripe';
import * as logout          from './logout';
import * as cron            from './cron';
import * as payoutAlert     from './payout-alert';
import * as processPayout   from './process-payout';
import * as info            from './info';
// import * as pay             from './pay';
import * as login           from './login';
import * as notify          from './notify';
import * as invoice         from './invoice';
import * as newsletterSubscribe from './newsletter-subscribe';
import * as supportMessage from './support-message';

export default {
  oauth, me, activate, signup,
  paymentMethods, messages,
  resetPassword, ms,
  fixtureMessages,
  contactDetails,
  profilePic, userDocuments,
  userDevice, phoneNumber,
  stripe, logout, cron, payoutAlert,
  processPayout, info,
  login, notify, invoice,

  newsletterSubscribe, supportMessage
  /*
  ping, apple, appLink, appRedirect,
  tos, bankAccounts, providers, pay,
  */
};
