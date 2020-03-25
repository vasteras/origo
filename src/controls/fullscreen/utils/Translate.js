/**
 *  @module origo/controls/fullscreen/utils/translate
 */

/**
 * @classdesc
 * Translate is a util for fullscreen to modify ...
 */

class Translate {
  /**
   * Build a new translator by passing a list where each item has
   * the following model
   * {
   *    key: value
   * }
   *
   * key is the name found in the app.
   * value is the desired value.
   *
   * Example
   *
   * {
   *    "Förskola": 'forskola'
   * }
   *
   * @param {*} list
   */
  constructor(list) {
    this.list = list;
  }
  get getList() {
    return this.list;
  }

  set setList(li) {
    this.list = li;
  }
  /**
   * Takes a name and finds that item in the list.
   *
   * Example
   *
   * values(Förskola) returns { 'Förskola': 'forskola' }
   *
   * @param {*} c
   */
  values(c) {
    return this.list.filter(o => o[c]);
  }


  /**
   * Takes a name and returns its value.
   *
   * Example
   *
   * parse(Förskola) returns forskola
   *
   * @param {*} name
   */

  parse(name) {
    return this.values(name)[0][name];
  }
}

export default Translate;
