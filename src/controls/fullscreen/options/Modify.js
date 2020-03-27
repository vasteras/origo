/**
 *  @module origo/controls/fullscreen/options/modify
 */

import ErrorHandler from '../utils/ErrorHandler';
import NullExpected from './modes/NullExpected';
import featureinfo from '../../../featureinfo';

/**
 * @classdesc
 * This class modifies the url params based on user options for fullscreen.
 */

class Modify {
  constructor(options) {
    this.options = options;
    this.errorHandler = new ErrorHandler(options);
    this.errorHandler.check('appUrl', 'field', 'config', 'translate', 'expect');
    const {
      appUrl, field, config, translate
    } = options;
    this.NullExpected = new NullExpected({
      Modify: {
        appUrl, field, config, translate
      }
    });
  }

  set setParams(params) {
    this.params = params;
  }

  get isReady() {
    this.setSelectionResults();
    if (this.selectedReslut) {
      this.mode = 'selection';
    } else {
      this.mode = 'no-selection';
    }
    const { appUrl, config, field } = this.options;
    return !!(appUrl && config && field && this.mode);
  }

  setSelectionResults() {
    this.selectedReslut = featureinfo.getSelectedResult();
    if (this.selectedReslut) {
      const { layer: { values_: { name: layerName } }, feature: { values_: values } } = this.selectedReslut[0];
      this.layerName = layerName;
      this.values = values;
    }
  }

  init() {
    const {
      mode, params, modified, selectedReslut, layerName, values
    } = this;

    this.NullExpected.addModifyState({
      mode, params, modified, selectedReslut, layerName, values
    });
    const { expect } = this.options;
    this.expectedMode = false;
    expect.forEach((field) => {
      if (this.params.includes(field)) {
        this.expectedMode = true;
        if (mode === 'selection') {
          console.log('expected field: ', field, 'selection');
        } else if (mode === 'no-selection') {
          console.log('expected field: ', field, 'no-selection');
        }
      }
    });

    this.NullExpected.init();
  }
}

export default Modify;
