import uuid          from 'uuid';
import bookshelf     from '../services/bookshelf';
import Base          from './base';
import PostalAddress from './postal-address';

const Business = Base.extend({
  tableName: 'businesses',

  owner() {
    return this.belongsTo('User', 'owner_id');
  },

  postalAddress() {
    return this.belongsTo('PostalAddress');
  },

  async isOk() {
    if (!this.get('taxId') || !this.get('type')) {
      return false;
    }

    const postalAddress = await this.getPostalAddress();
    return postalAddress.isOk();
  },

  async getPostalAddress() {
    if (this.get('postalAddressId')) {
      await this.load(['postalAddress']);
      return this.related('postalAddress');
    } else {
      const postalAddress = await PostalAddress.create();
      this.set('postalAddressId', postalAddress.get('id'));
      await this.save();
      return postalAddress;
    }
  },

  async postalAddressIsOwnerPersonalAddress() {
    await this.load(['owner']);
    const owner = this.related('owner');

    return (this.get('postalAddressId')
      && owner.get('postalAddressId') === this.get('postalAddressId')
    );
  }
}, {
  create: async function({ owner, postalAddress, ...props }) {
    const id = uuid.v4();

    return this.forge({
      id,
      ownerId: owner.id,
      postalAddressId: postalAddress.id,
      ...props
    })
      .save(null, { method: 'insert' });
  }
});

export default bookshelf.model('Business', Business);
