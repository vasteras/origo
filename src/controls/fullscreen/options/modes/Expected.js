import Controller from './utils/Controller';
import Cleaner from './utils/Cleaner';

class Expected {
  constructor(options) {
    this.options = options;
    const { Modify: opt, cleaner, expect } = options;
    this.Controller = new Controller(opt);
    this.Cleaner = new Cleaner(Object.assign(opt, { cleaner, expect }));
  }

  get modified() {
    return `${this.options.Modify.appUrl}#${this.ModifyState.params}`;
  }

  addModifyState(options) {
    this.ModifyState = options;
    this.Cleaner.addModifyState(options);
    this.Controller.addModifyState(options);
  }

  /**
   * unexpected field no-selection.
   */
  noSelection() {
    this.Cleaner.idToLayer();
    this.Controller.replaceConfig();
    this.ModifyState.params = this.Controller.params;
    this.Cleaner.cleanParam();
    this.ModifyState.params = this.Cleaner.params;
    this.Cleaner.replaceLayer();
    this.ModifyState.params = this.Cleaner.params;
    window.location.href = this.modified;
  }

  /**
   * Expected field with selection.
   */
  onSelection() {
    this.Controller.replaceConfig();
    this.ModifyState.params = this.Controller.params;
    this.Cleaner.cleanParam();
    this.ModifyState.params = this.Cleaner.params;
    const { ModifyState: { values }, options: { Modify: { field, translate } } } = this;
    const fieldValue = values[field];
    translate.forEach((item) => {
      if (item[fieldValue]) {
        const { layerName } = item;
        this.fieldValue = layerName;
      }
    });
    this.Cleaner.setlayerName(this.fieldValue);
    this.Cleaner.replaceLayer();
    this.ModifyState.params = this.Cleaner.params;
    window.location.href = this.modified;
  }

  init() {
    const { ModifyState: { mode } } = this;
    if (mode === 'selection') {
      this.onSelection();
    } else if (mode === 'no-selection') {
      this.noSelection();
    }
  }
}

export default Expected;
