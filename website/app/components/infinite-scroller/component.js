import Ember from 'ember';
import styles from './style';

// Number of items to instantiate beyond current view in the scroll direction.
const RUNWAY_ITEMS = 50;

// Number of items to instantiate beyond current view in the opposite direction.
const RUNWAY_ITEMS_OPPOSITE = 10;

// The animation interval (in ms) for fading in content from tombstones.
const ANIMATION_DURATION_MS = 200;

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
    this.onResize = this.onResize.bind(this);
  },

  /**
   * Called when the browser window resizes to adapt to new scroller bounds and
   * layout sizes of items within the scroller.
   */
  onResize() {
    // TODO: If we already have tombstones attached to the document, it would
    // probably be more efficient to use one of them rather than create a new
    // one to measure.
    //let tombstone = this.source_.createTombstone();
    //tombstone.style.position = 'absolute';
    //this.scroller_.appendChild(tombstone);
    //tombstone.classList.remove('invisible');
    //this.tombstoneSize_ = tombstone.offsetHeight;
    //this.tombstoneWidth_ = tombstone.offsetWidth;
    //this.scroller_.removeChild(tombstone);

    //// Reset the cached size of items in the scroller as they may no longer be
    //// correct after the item content undergoes layout.
    //for (let i = 0; i < this.items_.length; i++) {
      //this.items_[i].height = this.items_[i].width = 0;
    //}

    this.set('tombstoneSize', 50);
    this.set('tombstoneWidth', 100);
    this.onScroll();
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
    window.addEventListener('resize', this.onResize);
    this.onResize();
  },

  willDestroyElement() {
    const element = this.get('element');
    element.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
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
    this.set('firstAttachedItem', Math.max(0, start));
    this.set('lastAttachedItem', end);
    this.attachContent();
  },

  /**
   * Attaches content to the scroller and updates the scroll position if
   * necessary.
   */
  attachContent: function() {
    // Collect nodes which will no longer be rendered for reuse.
    // TODO: Limit this based on the change in visible items rather than looping
    // over all items.
    const unusedNodes = [];
    const items = this.get('items');
    const tombstones = this.get('tombstones');
    for (let i = 0; i < items.length; ++i) {
      // Skip the items which should be visible.
      if (i === this.get('firstAttachedItem')) {
        i = this.get('lastAttachedItem') - 1;
        continue;
      }
      if (items[i].node) {
        if (items[i].node.classList.contains('tombstone')) {
          tombstones.push(items[i].node);
          tombstones[tombstones.length - 1].classList.add('invisible');
        } else {
          unusedNodes.push(items[i].node);
        }
      }
      items[i].node = null;
    }

    const tombstoneAnimations = {};
    // Create DOM nodes.
    for (let i = this.firstAttachedItem_; i < this.lastAttachedItem_; ++i) {
      while (items.length <= i) {
        this.addItem();
      }
      if (items[i].node) {
        // if it's a tombstone but we have data, replace it.
        if (items[i].node.classList.contains('tombstone') &&
            items[i].data) {
          // TODO: Probably best to move items on top of tombstones and fade them in instead.
          if (ANIMATION_DURATION_MS) {
            items[i].node.style.zIndex = 1;
            tombstoneAnimations[i] = [items[i].node, items[i].top - this.anchorScrollTop];
          } else {
            items[i].node.classList.add('invisible');
            tombstones.push(items[i].node);
          }
          items[i].node = null;
        } else {
          continue;
        }
      }
      var node = items[i].data ? this.source_.render(this.items_[i].data, unusedNodes.pop()) : this.getTombstone();
      // Maybe don't do this if it's already attached?
      node.style.position = 'absolute';
      items[i].top = -1;
      this.get('element').appendChild(node);
      items[i].node = node;
    }


    // Remove all unused nodes
    const element = this.get('element');
    unusedNodes.forEach(node => element.removeChild(node));

    // Get the height of all nodes which haven't been measured yet.
    for (let i = this.firstAttachedItem_; i < this.lastAttachedItem_; ++i) {
      // Only cache the height if we have the real contents, not a placeholder.
      if (items[i].data && !items[i].height) {
        items[i].height = items[i].node.offsetHeight;
        items[i].width = items[i].node.offsetWidth;
      }
    }

    // Fix scroll position in case we have realized the heights of elements
    // that we didn't used to know.
    // TODO: We should only need to do this when a height of an item becomes
    // known above.
    let anchorScrollTop = 0;
    for (let i = 0; i < this.anchorItem.index; ++i) {
      anchorScrollTop += items[i].height || this.get('tombstoneSize');
    }
    anchorScrollTop += this.anchorItem.offset;

    // Position all nodes.
    var curPos = this.anchorScrollTop - this.anchorItem.offset;
    i = this.anchorItem.index;
    while (i > this.firstAttachedItem_) {
      curPos -= this.items_[i - 1].height || this.tombstoneSize_;
      i--;
    }
    while (i < this.firstAttachedItem_) {
      curPos += this.items_[i].height || this.tombstoneSize_;
      i++;
    }
    // Set up initial positions for animations.
    for (var i in tombstoneAnimations) {
      var anim = tombstoneAnimations[i];
      this.items_[i].node.style.transform = 'translateY(' + (this.anchorScrollTop + anim[1]) + 'px) scale(' + (this.tombstoneWidth_ / this.items_[i].width) + ', ' + (this.tombstoneSize_ / this.items_[i].height) + ')';
      // Call offsetTop on the nodes to be animated to force them to apply current transforms.
      this.items_[i].node.offsetTop;
      anim[0].offsetTop;
      this.items_[i].node.style.transition = 'transform ' + ANIMATION_DURATION_MS + 'ms';
    }
    for (i = this.firstAttachedItem_; i < this.lastAttachedItem_; i++) {
      var anim = tombstoneAnimations[i];
      if (anim) {
        anim[0].style.transition = 'transform ' + ANIMATION_DURATION_MS + 'ms, opacity ' + ANIMATION_DURATION_MS + 'ms';
        anim[0].style.transform = 'translateY(' + curPos + 'px) scale(' + (this.items_[i].width / this.tombstoneWidth_) + ', ' + (this.items_[i].height / this.tombstoneSize_) + ')';
        anim[0].style.opacity = 0;
      }
      if (curPos != this.items_[i].top) {
        if (!anim)
          this.items_[i].node.style.transition = '';
        this.items_[i].node.style.transform = 'translateY(' + curPos + 'px)';
      }
      this.items_[i].top = curPos;
      curPos += this.items_[i].height || this.tombstoneSize_;
    }

    this.scrollRunwayEnd_ = Math.max(this.scrollRunwayEnd_, curPos + SCROLL_RUNWAY)
    this.scrollRunway_.style.transform = 'translate(0, ' + this.scrollRunwayEnd_ + 'px)';
    this.scroller_.scrollTop = this.anchorScrollTop;

    if (ANIMATION_DURATION_MS) {
      // TODO: Should probably use transition end, but there are a lot of animations we could be listening to.
      setTimeout(function() {
        for (var i in tombstoneAnimations) {
          var anim = tombstoneAnimations[i];
          anim[0].classList.add('invisible');
          this.tombstones_.push(anim[0]);
          // Tombstone can be recycled now.
        }
      }.bind(this), ANIMATION_DURATION_MS)
    }

    this.maybeRequestContent();

  },

});
