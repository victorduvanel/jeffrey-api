import Ember from 'ember';
import styles from './style';
import InfiniteScroller from './infinite-scroll';

class ContentSource {
  constructor() {
    // Collect template nodes to be cloned when needed.
    this.tombstone_ = Ember.$(`
      <li class="chat-item tombstone" data-id="{{id}}">
        <img class="avatar" width="48" height="48" src="/assets/images/infinite-scroller/unknown.jpg">
        <div class="bubble">
          <p></p>
          <p></p>
          <p></p>
          <div class="meta">
            <time class="posted-date"></time>
          </div>
        </div>
      </li>
    `)[0];

    this.messageTemplate_ = Ember.$(`
      <li class="chat-item" data-id="{{id}}">
        <img class="avatar" width="48" height="48">
        <div class="bubble">
          <p></p>
          <img width="300" height="300">
          <div class="meta">
            <time class="posted-date"></time>
          </div>
        </div>
      </li>
    `)[0];

    this.nextItem_ = 0;
  }

  /**
   * Fetch more items from the data source. This should try to fetch at least
   * count items but may fetch more as desired. Subsequent calls to fetch should
   * fetch items following the last successful fetch.
   * @param {number} count The minimum number of items to fetch for display.
   * @return {Promise(Array<Object>)} Returns a promise which will be resolved
   *     with an array of items.
   */
  fetch(count) {
    return new Ember.RSVP.Promise((resolve, reject) => {
    });

    // Fetch at least 30 or count more objects for display.
    count = Math.max(30, count);
    return new Ember.RSVP.Promise((resolve, reject) => {
      // Assume 50 ms per item.
      Ember.run.later(() => {
        let items = [];
        for (let i = 0; i < Math.abs(count); i++) {
          items[i] = getItem(this.nextItem_++);
        }
        resolve(Ember.RSVP.all(items));
      }, 1000 /* Simulated 1 second round trip time */ );
    });
  }

  /**
   * Create a tombstone element. All tombstone elements should be identical
   * @return {Element} A tombstone element to be displayed when item data is not
   *     yet available for the scrolled position.
   */
  createTombstone() {
    return this.tombstone_.cloneNode(true);
  }

  /**
   * Render an item, re-using the provided item div if passed in.
   * @param {Object} item The item description from the array returned by fetch.
   * @param {?Element} element If provided, this is a previously displayed
   *     element which should be recycled for the new item to display.
   * @return {Element} The constructed element to be displayed in the scroller.
   */
  render(item, div) {
    console.log('render', item, div);
  }
}

export default Ember.Component.extend({
  styles,

  localClassNames: ['component'],

  didInsertElement() {
    const container = document.createElement('ul');
    container.className = styles['chat-timeline'];

    const contentSource = new ContentSource();

    const infiniteScroller = new InfiniteScroller(container, contentSource);

    const element = this.get('element');
    element.append(container);
  },

  willDestroyElement() {
    console.log('willDestroyElement');
  }
});
