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
  },

  graphqlDef: function() {
    return `
      enum BusinessType {
        personal
        individual
      }
      input BusinessDetails {
        name: String
        type: String
        taxId: String
        city: String
        country: String
        isOwnerPersonalAddress: Boolean
        line1: String
        line2: String
        postalCode: String
        state: String
      }
      type Business {
        id: ID!
        taxId: String
        name: String
        type: BusinessType
        isOwnerPersonalAddress: Boolean
        postalAddress: PostalAddress
      }
    `;
  },

  resolver: {
    Business: {
      postalAddress: async({ id }) => {
        const business = await Business.find(id);
        const postalAddress = await business.getPostalAddress();

        return {
          id: postalAddress.id,
          city: postalAddress.get('city'),
          country: postalAddress.get('country'),
          line1: postalAddress.get('line1'),
          line2: postalAddress.get('line2'),
          postalCode: postalAddress.get('postalCode'),
          state: postalAddress.get('state'),
        };
      }
    },

    Query: {
      businessDetails: async (_, __, { user }) => {
        if (!user) {
          return null;
        }

        const business = await user.getBusiness();
        const isOwnerPersonalAddress = await business.postalAddressIsOwnerPersonalAddress();

        return {
          id: business.id,
          name: business.get('name'),
          taxId: business.get('taxId'),
          type: business.get('type'),
          isOwnerPersonalAddress
        };
      }
    },

    Mutation: {
      businessDetails: async (_, { details }, { user }) => {
        if (!user) {
          return null;
        }

        const business = await user.getBusiness();
        const isOwnerPersonalAddress = await business.postalAddressIsOwnerPersonalAddress();

        const {
          name,
          type,
          taxId,

          city,
          country,
          line1,
          line2,
          postalCode,
          state
        } = details;

        business.set('name', name);
        business.set('type', type);
        business.set('taxId', taxId);

        if (details.isOwnerPersonalAddress) {
          business.set('postalAddressId', user.get('postalAddressId'));
        } else {
          // We do not allow update of the postal address id the address is the
          // business owner's personal address.
          // Instead we create a new postal address for the business.
          if (isOwnerPersonalAddress) {
            const newPostallAddress = await PostalAddress.create({
              city,
              country,
              line1,
              line2,
              postalCode,
              state
            });

            business.set('postalAddressId', newPostallAddress.id);
          } else {
            const postalAddress = await business.getPostalAddress();
            await postalAddress.update({
              city,
              country,
              line1,
              line2,
              postalCode,
              state
            });
          }
        }

        if (business.hasChanged()) {
          await business.save();
        }

        return true;
      }
    }
  }
});

export default bookshelf.model('Business', Business);
