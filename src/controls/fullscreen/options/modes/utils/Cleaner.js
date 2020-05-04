import Replacer from '../../../utils/Replacer';

class Cleaner {
  constructor(options) {
    this.options = options;
  }

  addModifyState(options) {
    this.ModifyState = options;
  }

  cleanParam() {
    const { options: { cleaner: { defaults } }, ModifyState: { params } } = this;
    let results = '';
    params.split('&').forEach((param) => {
      defaults.forEach((def) => {
        if (param.includes(def)) {
          results += `&${param}`;
        }
      });
    });
    this.params = results; // .substring(0, results.length - 1);
  }

  translateConnectOn(value) {
    const { options: { translate } } = this;
    translate.forEach((item) => {
      const v = Object.values(item);
      if (v.includes(typeof value === 'string' ? parseInt(value, 10) : value)) {
        const { layerName } = item;
        this.setlayerName(layerName);
      }
    });
  }

  setlayerName(name) {
    this.layerName = `${name}`;
  }

  findID() {
    const { ModifyState: { params }, options: { cleaner: { connectOn } } } = this;
    params.split('&').forEach((param) => {
      const paramSplit = param.split('=');
      if (paramSplit[0] === connectOn) {
        const value = paramSplit[1];
        this.translateConnectOn(value);
      }
    });
  }

  idToLayer() {
    this.findID();
  }

  replaceLayer() {
    const { layerName, ModifyState: { params }, options: { cleaner: { replace } } } = this;
    const re = new Replacer({ target: params, find: replace, change: layerName });
    this.params = re.replaceAll();
  }
}

export default Cleaner;
