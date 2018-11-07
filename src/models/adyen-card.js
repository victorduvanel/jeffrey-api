import bookshelf    from '../services/bookshelf';
import adyen        from '../services/adyen';
import Base         from './base';

const AdyenCard = Base.extend({
  tableName: 'adyen_cards',

  type() {
    return this.get('type');
  },

  lastFour() {
    return this.get('lastFour');
  },

  expMonth() {
    return this.get('expMonth');
  },

  expYear() {
    return this.get('expYear');
  },

  holderName() {
    return this.get('holderName');
  },

  user() {
    return this.belongsTo('User');
  },
}, {
  create: async function({ user, req, cardDetails }) {
    const card = await adyen.createCard(user, req, cardDetails);

    const newCard = await this
      .forge({
        id         : card.id,
        userId     : user.get('id'),
        type       : card.type,
        lastFour   : card.lastFour,
        holderName : card.holderName,
        expMonth   : card.expMonth,
        expYear    : card.expYear
      })
      .save(null, { method: 'insert' });

    return newCard;
  }
});

export default bookshelf.model('AdyenCard', AdyenCard);
