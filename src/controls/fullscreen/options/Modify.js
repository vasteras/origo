/**
 *  @module origo/controls/fullscreen/options/modify
 */

import Translate from '../utils/Translate';
import Replacer from '../utils/Replacer';
import featureinfo from '../../../featureinfo';
/**
 * @classdesc
 * This class modifies the url params based on user options for fullscreen.
 */

class Modify {
  constructor(options) {
    this.options = options;
    const { translate } = options;
    this.translator = new Translate(translate);
    this.selectedReslut = [];
    this.selectedReslut.length = 0;
  }
  set setParams(params) {
    this.params = params;
  }
  setSelectionResults() {
    this.selectedReslut = featureinfo.getSelectedResult();
    const { layer: { values_: { name: layerName } }, feature: { values_: values } } = this.selectedReslut[0];
    this.layerName = layerName;
    this.values = values;
  }
  get isReady() {
    this.setSelectionResults();
    const { appUrl, config, pick } = this.options;
    return !!(appUrl && config && pick && this.selectedReslut);
  }
  get modified() {
    return `${this.options.appUrl}#${this.params}`;
  }
  controlLayerName(layerName, selectedField) {
    const re = new Replacer({ target: this.params, find: layerName, change: this.translator.parse(selectedField) });
    this.params = re.replaceAll();
  }

  controlConfigName() {
    const re = new Replacer({ target: this.params, find: this.last, change: this.options.config });
    this.params = re.replaceAll();
  }

  fromLast(n) {
    const lastSplit = this.params.split('=');
    this.last = lastSplit[lastSplit.length - n];
  }

  init() {
    const { pick, config } = this.options;
    this.selectedField = this.values[pick];
    this.controlLayerName(this.layerName, this.selectedField);
    this.fromLast(1);
    if (config !== this.last) {
      this.controlConfigName();
    }
    window.open(this.modified);
  }
}

export default Modify;
