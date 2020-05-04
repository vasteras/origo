/**
 *  @module origo/controls/fullscreen/options/modify
 */

import ErrorHandler from '../utils/ErrorHandler';
import NullExpected from './modes/NullExpected';
import Expected from './modes/Expected';
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
      appUrl, field, config, translate, cleaner, expect
    } = options;
    const ModifyOptions = {
      Modify: {
        appUrl, field, config, translate
      }
    };
    this.NullExpected = new NullExpected(ModifyOptions);
    const ExtendedModifyOptions = Object.assign(ModifyOptions, { cleaner, expect });
    this.Expected = new Expected(ExtendedModifyOptions);
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
    this.selectedPin = featureinfo.getPin();
    if (this.selectedReslut) {
      const { layer: { values_: { name: layerName } }, feature: { values_: values } } = this.selectedReslut[0];
      this.layerName = layerName;
      this.values = values;
    }
  }

  initExpectedMode() {
    const { expect } = this.options;
    this.expectedMode = false;
    expect.forEach((field) => {
      if (this.params.includes(field.toUpperCase()) || this.params.includes(field.toLowerCase())) {
        this.expectedMode = true;
      }
    });
  }

  appendToParamas(add) {
    const notMap = this.params.split('&map=');
    const map = notMap[1];
    notMap.concat(notMap, add).concat(notMap, map);
  }

  setPin() {
    const { selectedPin: pin } = this;
    if (pin) {
      const coords = pin.getGeometry().getCoordinates();
      const str = `&pin=${coords[0]},${coords[1]}`;
      this.appendToParamas(str);
    }
  }

  init() {
    this.setPin();
    this.initExpectedMode();
    const {
      mode, params, modified, selectedReslut, layerName, values, expectedMode
    } = this;

    if (expectedMode) {
      this.Expected.addModifyState({
        mode, params, modified, selectedReslut, layerName, values
      });
      this.Expected.init();
    } else {
      this.NullExpected.addModifyState({
        mode, params, modified, selectedReslut, layerName, values
      });
      this.NullExpected.init();
    }
  }
}

export default Modify;
