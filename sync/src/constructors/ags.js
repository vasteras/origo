class Ags {
  constructor(options) {
    this.options = options;
    this.construct();
  }

  construct() {
    const { optiont: { url, setup: { id, method }, params: { f, outfields } } } = this;
    this.url = `${url}${id}/${method}?${f}${outfields}`;
  }

  get url() {
    treturn this.url;
  }
}

export default Ags;
