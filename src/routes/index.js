import * as oauth from './oauth';
import * as me from './me';
import * as paymentMethods from './payment-methods';
import * as contactDetails from './contact-details';
import * as profilePic from './profile-pic';
import * as userDocuments from './user-documents';
import * as userDevice from './user-device';
import * as phoneNumber from './phone-number';
import * as stripe from './stripe';
import * as logout from './logout';
import * as cron from './cron';
import * as payoutAlert from './payout-alert';
import * as processPayout from './process-payout';
import * as info from './info';
import * as login from './login';
import * as notify from './notify';
import * as invoice from './invoice';
import * as newsletterSubscribe from './newsletter-subscribe';
import * as supportMessage from './support-message';

export default {
  oauth, me, paymentMethods,
  contactDetails, profilePic, userDocuments,
  userDevice, phoneNumber, stripe,
  logout, cron, payoutAlert,
  processPayout, info, login,
  notify, invoice, newsletterSubscribe,
  supportMessage
};
