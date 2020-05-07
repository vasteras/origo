import ags from './constructors/ags';

class uBuilder {
  constructor(options) {
    this.options = options;
    this.construct();
  }

  construct() {
    const { options: { type } } = this;
    if (type === 'ags') {
      this.ags = new ags(this.options);
      this.url = ags.get('url');
    }
  }

  get url() {
    return this.url;
  }
}

export default uBuilder;
