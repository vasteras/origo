import Translate from '../../../utils/Translate';
import Replacer from '../../../utils/Replacer';

class Controller {
  constructor(options) {
    this.options = options;
    const { translate } = options;
    this.translator = new Translate(translate);
  }

  addModifyState(options) {
    this.ModifyState = options;
  }

  controlLayerName(layerName, selectedField) {
    const re = new Replacer({ target: this.ModifyState.params, find: layerName, change: this.translator.parse(selectedField) });
    this.ModifyState.params = re.replaceAll();
  }

  controlConfigName() {
    const { last, options: { config } } = this;
    const { params } = this.ModifyState;
    const re = new Replacer({ target: params, find: last, change: config });
    this.params = re.replaceAll();
  }

  fromLast(n) {
    const lastSplit = this.ModifyState.params.split('=');
    this.last = lastSplit[lastSplit.length - n];
  }

  replaceConfig() {
    const { config } = this.options;
    this.fromLast(1);
    if (config !== this.last) {
      this.controlConfigName();
    }
  }
}

export default Controller;
