import $ from 'jquery';
import viewer from './src/viewer';
import mapLoader from './src/maploader';
import controlInitialiser from './src/controlinitialiser';
import origoConfig from './conf/origoConfig';
import controls from './conf/origoControls';

const origo = {};
origo.map = {};
origo.config = origoConfig;
origo.controls = controls;

let view;

function init(config) {
  viewer.init(config.el, config.options);
  // Init controls
  controlInitialiser.init(config.options.controls);
  view = viewer;
}

origo.getView = function getView() {
  return view;
};

origo.map.init = function initMap(options, defaultOptions) {
  const config = defaultOptions ? $.extend(origo.config, defaultOptions) : origo.config;
  const map = mapLoader(options, config);
  if (map) {
    map.then((mapConfig) => {
      init(mapConfig);
    });
    return viewer;
  }
  return null;
};

export default origo;
