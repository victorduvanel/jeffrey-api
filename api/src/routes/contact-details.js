import bodyParser     from 'body-parser';
import oauth2         from '../middlewares/oauth2';
import ContactDetail  from '../models/contact-detail';

export const get = [
  oauth2,

  async (req, res) => {
    const user = await req.user.load('contactDetail');
    let contactDetail = user.related('contactDetail');

    if (contactDetail.length) {
      contactDetail = contactDetail.at(0);

      res.send({
        'contact-detail': {
          'first-name'          : contactDetail.get('firstName'),
          'last-name'           : contactDetail.get('lastName'),
          'address-first-line'  : contactDetail.get('addressFirstLine'),
          'address-second-line' : contactDetail.get('addressSecondLine'),
          'city'                : contactDetail.get('city'),
          'postal-code'         : contactDetail.get('postalCode'),
          'company-name'        : contactDetail.get('companyName'),
          'vat-number'          : contactDetail.get('vatNumber')
        }
      });
    } else {
      res.send({
        'contact-detail': null
      });
    }
  }
];

export const post = [
  oauth2,
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const { body } = req;

    const user = await req.user.load('contactDetail');
    let contactDetail = user.related('contactDetail');

    if (false && contactDetail.length) {
      contactDetail = contactDetail.at(0);
      contactDetail.set({
        firstName: body.first_name,
        lastName: body.last_name,
        city: body.city,
        postalCode: body.postal_code,
        addressFirstLine: body.address_first_line,
        addressSecondLine: body.address_second_line,
        companyName: body.company_name,
        vatNumber: body.vat_number
      });
      await contactDetail.save();
    } else {
      contactDetail = await ContactDetail.create({
        user,
        firstName: body.first_name,
        lastName: body.last_name,
        city: body.city,
        postalCode: body.postal_code,
        addressFirstLine: body.address_first_line,
        addressSecondLine: body.address_second_line,
        companyName: body.company_name,
        vatNumber: body.vat_number,
      });
    }

    res.send({
      success: true
    });
  }
];
