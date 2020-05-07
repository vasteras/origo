import uBuilder from 'uBuilder';

class Sync {
  constructor(options) {
    this.options = options;
    this.builder = new uBuilder(options);
    this.url = this.builder.getUrl();
    console.log(this.url);
  }

  static getAllFeatures() {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', () => {
      if (this.readyState === 4) {
        console.log(this.responseText);
      }
    });

    xhr.open('GET', 'https://kartor.vasteras.se/arcgis/rest/services/ext/webbobjekt_dyn/FeatureServer/0/query?f=json&outFields=pageid');

    xhr.send();
  }
}

export default Sync;
