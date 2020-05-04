import Controller from './utils/Controller';

class NullExpected {
  constructor(options) {
    this.options = options;
    const { Modify: opt } = options;
    this.Controller = new Controller(opt);
  }

  get modified() {
    return `${this.options.Modify.appUrl}#${this.ModifyState.params}`;
  }

  addModifyState(options) {
    this.ModifyState = options;
    this.Controller.addModifyState(options);
  }

  noSelection() {
    this.Controller.replaceConfig();
    this.ModifyState.params = this.Controller.params;
    console.log('NullExpected window open: ', this.modified);
    // window.open(this.ModifyState.modified);
  }

  onSelection() {
    const { field } = this.options.Modify;
    this.selectedField = this.ModifyState.values[field];
    this.Controller.controlLayerName(this.ModifyState.layerName, this.selectedField);
    this.Controller.replaceConfig();
    this.ModifyState.params = this.Controller.params;
    console.log('NullExpected window open: ', this.modified);
    // window.open(this.modified);
  }

  init() {
    if (this.ModifyState.mode === 'selection') {
      this.onSelection();
    } else if (this.ModifyState.mode === 'no-selection') {
      this.noSelection();
    }
  }
}

export default NullExpected;
