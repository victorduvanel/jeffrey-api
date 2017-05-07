import Ember from 'ember';
import styles from './style';

const RUNWAY_ITEMS = 50;
const RUNWAY_ITEMS_OPPOSITE = 10;

export default Ember.Component.extend({
  anchorScrollTop: 0,
  anchorItem: { index: 0, offset: 0 },

  tombstoneSize: 0,

  items: [],

  styles,

  localClassNames: ['component'],

  init() {
    this._super(...arguments);

    this.onScroll = this.onScroll.bind(this);
  },

  /**
   * Called when the browser window resizes to adapt to new scroller bounds and
   * layout sizes of items within the scroller.
   */
  onResize() {
    // TODO: If we already have tombstones attached to the document, it would
    // probably be more efficient to use one of them rather than create a new
    // one to measure.
    let tombstone = this.source_.createTombstone();
    tombstone.style.position = 'absolute';
    this.scroller_.appendChild(tombstone);
    tombstone.classList.remove('invisible');
    this.tombstoneSize_ = tombstone.offsetHeight;
    this.tombstoneWidth_ = tombstone.offsetWidth;
    this.scroller_.removeChild(tombstone);

    // Reset the cached size of items in the scroller as they may no longer be
    // correct after the item content undergoes layout.
    for (let i = 0; i < this.items_.length; i++) {
      this.items_[i].height = this.items_[i].width = 0;
    }
    this.onScroll_();
  },

  /**
   * Called when the scroller scrolls. This determines the newly anchored item
   * and offset and then updates the visible elements, requesting more items
   * from the source if we've scrolled past the end of the currently available
   * content.
   */
  onScroll() {
    const element = this.get('element');
    const scrollTop = element.scrollTop;

    const delta = scrollTop - this.get('anchorScrollTop');

    let anchorItem = this.get('anchorItem');
    // Special case, if we get to very top, always scroll to top.
    if (scrollTop === 0) {
      anchorItem = { index: 0, offset: 0 };
    } else {
      anchorItem = this.calculateAnchoredItem(anchorItem, delta);
    }
    this.set('anchorItem', anchorItem);
    this.set('anchorScrollTop', scrollTop);

    const lastScreenItem = this.calculateAnchoredItem(anchorItem, element.offsetHeight);

    if (delta < 0) {
      this.fill(anchorItem.index - RUNWAY_ITEMS, lastScreenItem.index + RUNWAY_ITEMS_OPPOSITE);
    } else {
      this.fill(anchorItem.index - RUNWAY_ITEMS_OPPOSITE, lastScreenItem.index + RUNWAY_ITEMS);
    }
  },

  didInsertElement() {
    const element = this.get('element');
    element.addEventListener('scroll', this.onScroll);
    this.onScroll();
  },

  willDestroyElement() {
    const element = this.get('element');
    element.removeEventListener('scroll', this.onScroll);
  },

  /**
    * Calculates the item that should be anchored after scrolling by delta from
    * the initial anchored item.
    * @param {{index: number, offset: number}} initialAnchor The initial position
    *     to scroll from before calculating the new anchor position.
    * @param {number} delta The offset from the initial item to scroll by.
    * @return {{index: number, offset: number}} Returns the new item and offset
    *     scroll should be anchored to.
    */
  calculateAnchoredItem(initialAnchor, delta) {
    if (delta === 0) {
      return initialAnchor;
    }
    delta += initialAnchor.offset;

    let i = initialAnchor.index;
    let tombstones = 0;
    const items = this.get('items');
    const tombstoneSize = this.get('tombstoneSize');

    if (delta < 0) {
      while (delta < 0 && i > 0 && items[i - 1].height) {
        delta += items[i - 1].height;
        --i;
      }
      tombstones = Math.max(-i, Math.ceil(Math.min(delta, 0) / tombstoneSize));
    } else {
      while (delta > 0 && i < items.length && items[i].height && items[i].height < delta) {
        delta -= items[i].height;
        ++i;
      }
      if (i >= items.length || !items[i].height) {
        tombstones = Math.floor(Math.max(delta, 0) / tombstoneSize);
      }
    }
    i += tombstones;
    delta -= tombstones * tombstoneSize;

    return {
      index: i,
      offset: delta,
    };
  },

  /**
   * Sets the range of items which should be attached and attaches those items.
   * @param {number} start The first item which should be attached.
   * @param {number} end One past the last item which should be attached.
   */
  fill(start, end) {
    console.log('fill', start, end);

    /*
    this.firstAttachedItem_ = Math.max(0, start);
    this.lastAttachedItem_ = end;
    this.attachContent();
    */
  }


});
