/**
 *  @module origo/controls/fullscreen/utils/replacer
 */

/**
 * @classdesc
 *
 */

class Replacer {
  /**
   * Builds a custom Replacer that cant load options.
   * Has methods for searching in string and replacing content.
   * @param {*} options
   */
  constructor(options) {
    this.options = options;
  }

  get getOptions() {
    return this.options;
  }

  set setOptions(options) {
    this.options = options;
  }

  /**
   * Replaces all occurences of a word stored in change.
   * Searches in target.
   */
  replaceAll() {
    const { target, find, change } = this.options;
    const re = new RegExp(find, 'g');
    return target.replace(re, change);
  }
}

export default Replacer;
