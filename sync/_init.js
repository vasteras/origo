import Sync from 'Sync';

const options = {
  type: 'ags',
  url: 'https://kartor.vasteras.se/arcgis/rest/services/ext/webbobjekt_dyn/FeatureServer/',
  setup: {
    id: 0,
    method: 'query'
  },
  params: {
    f: 'json',
    outFields: 'pageid'
  }
};

function init() {
  console.log('init');
  const mySync = new Sync(options);
  mySync.getAllFeatures();
}

init();
