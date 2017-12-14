import oauth2       from '../middlewares/oauth2';
import PhoneNumber  from '../models/phone-number';
import Invoice      from '../models/invoice';
import Product      from '../models/product';
import Subscription from '../models/subscription';
import config       from '../config';

import { Unauthorized, NotFound } from '../errors';

const jsonAPISerialize = (phoneNumber) => {
  return {
    id: phoneNumber.get('id'),
    type: 'phone-number',
    attributes: {
      'phone-number': phoneNumber.get('phoneNumber')
    }
  };
};

export const get = [
  oauth2,
  async (req, res) => {
    const user = req.user;

    await user.load('phoneNumbers');
    let phoneNumbers = user.related('phoneNumbers');

    phoneNumbers = phoneNumbers.map(jsonAPISerialize);

    res.json({
      data: phoneNumbers
    });
  }
];

export const getOne = [
  oauth2,
  async (req, res) => {
    const user = req.user;
    const phoneNumberId = req.params.phone_number_id;

    await user.load('phoneNumbers');
    let phoneNumber = await PhoneNumber
      .forge({
        id: phoneNumberId,
        userId: user.get('id')
      })
      .fetch();

    if (phoneNumber) {
      res.send({
        data: jsonAPISerialize(phoneNumber)
      });
    } else {
      throw NotFound;
    }
  }
];

export const post = [
  oauth2,
  async (req, res) => {
    const user = req.user;

    const invoice = await Invoice.create({
      user,
      currency: 'eur'
    });

    const product = await Product.find(config.app.phoneNumberProductId);
    await invoice.addProduct({ product });
    await invoice.charge();

    let phoneNumber = await PhoneNumber.associateAvailable(user);
    if (!phoneNumber) {
      phoneNumber = await PhoneNumber.purchase(user);
    }

    await Subscription.create({
      user,
      phoneNumber,
      frequency: 'monthly'
    });

    res.send({
      data: jsonAPISerialize(phoneNumber)
    });
  }
];

export const destroy = [
  oauth2,
  async (req, res) => {
    const user = req.user;
    const phoneNumberId = req.params.phone_number_id;

    let phoneNumber = await PhoneNumber
      .forge({
        id: phoneNumberId,
        userId: user.get('id')
      })
      .fetch();

    if (phoneNumber) {
      const subscription = await Subscription.find({ user, phoneNumber });

      await subscription.cancel();

      res.send({
        meta: {}
      });
    } else {
      throw NotFound;
    }
  }
];
