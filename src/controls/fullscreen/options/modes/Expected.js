class Expected {
  constructor(options) {
    this.options = options;
    const { Modify: opt } = options;
  }

  addModifyState(options) {
    this.ModifyState = options;
  }

  init() {
    const { ModifyState: { mode } } = this;
    if (mode === 'selection') {
      console.log('expected field: ', 'selection');
    } else if (mode === 'no-selection') {
      console.log('expected field: ', 'no-selection');
    }
  }
}

export default Expected;
