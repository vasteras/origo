import proj4 from 'proj4';
import Map from 'ol/Map';
import View from 'ol/View';
import Collection from 'ol/Collection';
import Projection from 'ol/proj/Projection';
import { register } from 'ol/proj/proj4';
import Feature from 'ol/Feature';
import geom from 'ol/geom/Geometry';
import PointerEvent from 'ol/pointer/PointerEvent';
import MapBrowserPointerEvent from 'ol/MapBrowserPointerEvent';
import Polygon from 'ol/geom/Polygon';
import $ from 'jquery';
import template from './templates/viewertemplate';
import elQuery from './utils/elquery';
import featureinfo from './featureinfo';
import getcenter from './geometry/getcenter';
import maputils from './maputils';
import getattributes from './getattributes';
import style from './style';
import layerCreator from './layercreator';
import dispatcher from './controls/editor/editdispatcher';
import animation from './controls/animation';

let map;
const settings = {
  projection: '',
  projectionCode: '',
  projectionExtent: '',
  extent: [],
  center: [0, 0],
  zoom: 0,
  resolutions: null,
  source: {},
  group: [],
  layers: [],
  styles: {},
  controls: [],
  featureInfoOverlay: undefined,
  editLayer: null
};
let urlParams;
let pageSettings;
let mapOptions;
const pageTemplate = {};
let titles = [];

function render(el, options) {
  pageSettings = options.pageSettings;
  pageTemplate.mapClass = 'o-map';

  if (pageSettings) {
    if (pageSettings.footer) {
      if ('img' in pageSettings.footer) {
        pageTemplate.img = pageSettings.footer.img;
      }
      if ('text' in pageSettings.footer) {
        pageTemplate.text = pageSettings.footer.text;
      }
      if ('url' in pageSettings.footer) {
        pageTemplate.url = pageSettings.footer.url;
      }
      if ('urlText' in pageSettings.footer) {
        pageTemplate.urlText = pageSettings.footer.urlText;
      }
    }
    if (pageSettings.mapGrid) {
      if ('visible' in pageSettings.mapGrid && pageSettings.mapGrid.visible === true) {
        pageTemplate.mapClass = 'o-map o-map-grid';
      }
    }
  }

  $(el).html(template(pageTemplate));
}

function getUnits(proj) {
  let units;
  switch (proj) {
    case 'EPSG:3857':
      units = 'm';
      break;
    case 'EPSG:4326':
      units = 'degrees';
      break;
    default:
      units = proj4.defs(proj) ? proj4.defs(proj).units : undefined;
  }
  return units;
}

function loadMap() {
  map = new Map({
    target: 'o-map',
    controls: [],
    view: new View({
      extent: settings.extent || undefined,
      projection: settings.projection || undefined,
      center: settings.center,
      resolutions: settings.resolutions || undefined,
      zoom: settings.zoom,
      enableRotation: settings.enableRotation
    })
  });
}

function createLayers(layerlist, savedLayers) {
  const layers = [];
  for (let i = layerlist.length - 1; i >= 0; i -= 1) {
    let savedLayer = {};
    if (savedLayers) {
      savedLayer = savedLayers[layerlist[i].name.split(':').pop()] || {
        visible: false,
        legend: false
      };
      savedLayer.name = layerlist[i].name;
    }
    const layer = $.extend(layerlist[i], savedLayer);
    layers.push(layerCreator(layer));
  }
  return layers;
}


function addLayers(layers) {
  layers.forEach((layer) => {
    map.addLayer(layer);
  });
}

function getSettings() {
  return settings;
}

function getExtent() {
  return settings.extent;
}

function getBaseUrl() {
  return settings.baseUrl;
}

function getBreakPoints(size) {
  return size && size in settings.breakPoints ? settings.breakPoints[size] : settings.breakPoints;
}

function getMapName() {
  return settings.map;
}

function getTileGrid() {
  return settings.tileGrid;
}

function getTileSize() {
  return settings.tileSize;
}

function getTitles() {
  return titles;
}

function setTitles(t) {
  titles = t;
}

function getUrl() {
  return settings.url;
}

function getUrlParams() {
  return urlParams;
}

function getStyleSettings() {
  return settings.styles;
}

function getResolutions() {
  return settings.resolutions;
}

function getMapUrl() {
  let layerNames = '';
  let url;

  // delete search arguments if present
  if (window.location.search) {
    url = window.location.href.replace(window.location.search, '?');
  } else {
    url = `${window.location.href}?`;
  }
  const mapView = map.getView();
  const center = mapView.getCenter();
  for (let i = 0; i < 2; i += 1) {
    center[i] = parseInt(center[i], 10); // coordinates in integers
  }
  const zoom = mapView.getZoom();
  const layers = map.getLayers();

  // add layer if visible
  layers.forEach((el) => {
    if (el.getVisible() === true) {
      layerNames += `${el.get('name')};`;
    } else if (el.get('legend') === true) {
      layerNames += `${el.get('name')},1;`;
    }
  });
  return `${url}${center}&${zoom}&${layerNames.slice(0, layerNames.lastIndexOf(';'))}`;
}

function getMap() {
  return map;
}

function getLayers() {
  return settings.layers;
}

function getLayersByProperty(key, val, byName) {
  const layers = map.getLayers().getArray().filter(layer => layer.get(key) && layer.get(key) === val);

  if (byName) {
    return layers.map(layer => layer.get('name'));
  }
  return layers;
}

function getLayer(layername) {
  const layer = $.grep(settings.layers, obj => obj.get('name') === layername);
  return layer[0];
}

function getQueryableLayers() {
  const queryableLayers = settings.layers.filter(layer => layer.get('queryable') && layer.getVisible());
  return queryableLayers;
}

function getSearchableLayers(searchableDefault) {
  const searchableLayers = [];
  map.getLayers().forEach((layer) => {
    let searchable = layer.get('searchable');
    const visible = layer.getVisible();
    searchable = searchable === undefined ? searchableDefault : searchable;
    if (searchable === 'always' || (searchable && visible)) {
      searchableLayers.push(layer.get('name'));
    }
  });
  return searchableLayers;
}

function getGroup(group) {
  return settings.layers.filter(obj => obj.get('group') === group);
}

function getSubgroups() {
  const subgroups = [];

  function findSubgroups(groups, n) {
    if (n >= groups.length) {
      return;
    }

    if (groups[n].groups) {
      groups[n].groups.forEach((subgroup) => {
        subgroups.push(subgroup);
      });

      findSubgroups(groups[n].groups, 0);
    }

    findSubgroups(groups, n + 1);
  }

  findSubgroups(settings.groups, 0);
  return subgroups;
}

function getGroups(opt) {
  if (opt === 'top') {
    return settings.groups;
  } else if (opt === 'sub') {
    return getSubgroups();
  }
  return settings.groups.concat(getSubgroups());
}

function getProjectionCode() {
  return settings.projectionCode;
}

function getProjection() {
  return settings.projection;
}

function getMapSource() {
  return settings.source;
}
function getMapOptions() {
  return mapOptions;
}
function getControlNames() {
  return settings.controls.map(obj => obj.name);
}

function getTarget() {
  return settings.target;
}

function getClusterOptions() {
  return settings.clusterOptions;
}

function checkScale(scale, maxScale, minScale) {
  if (maxScale || minScale) {
    // Alter 1: maxscale and minscale
    if (maxScale && minScale) {
      if ((scale > maxScale) && (scale < minScale)) {
        return true;
      }
    } else if (maxScale) {
      // Alter 2: only maxscale
      if (scale > maxScale) {
        return true;
      }
    } else if (minScale) {
      // Alter 3: only minscale
      if (scale < minScale) {
        return true;
      }
    }
  } else {
    // Alter 4: no scale limit
    return true;
  }
  return false;
}

function getConsoleId() {
  return settings.consoleId;
}

function getScale(resolution) {
  const dpi = 25.4 / 0.28;
  const mpu = settings.projection.getMetersPerUnit();
  let scale = resolution * mpu * 39.37 * dpi;
  scale = Math.round(scale);
  return scale;
}

function removeLayer(name) {
  settings.layers.forEach((layer, i, obj) => {
    if (layer.get('name') === name) {
      obj.splice(i, 1);
    }
  });

  const $ul = $('#o-mapmenu').find(`#${name}`).closest('ul');
  $ul.find(`#${name}`).remove();
  if ($ul.children().length === 1) {
    $ul.remove();
  }

  $(`#o-legend-${name}`).remove();
  map.removeLayer(getLayersByProperty('name', name)[0]);
}

function removeOverlays(overlays) {
  if (overlays) {
    if (overlays.constructor === Array || overlays instanceof Collection) {
      overlays.forEach((overlay) => {
        map.removeOverlay(overlay);
      });
    } else {
      map.removeOverlay(overlays);
    }
  } else {
    map.getOverlays().clear();
  }
}

function init(el, options) {
  mapOptions = options;
  render(el, mapOptions);

  // Read and set projection
  if ('proj4Defs' in mapOptions && proj4) {
    const proj = mapOptions.proj4Defs;

    // Register proj4 projection definitions
    for (let i = 0; i < proj.length; i += 1) {
      proj4.defs(proj[i].code, proj[i].projection);
      if (Object.prototype.hasOwnProperty.call(proj[i], 'alias')) {
        proj4.defs(proj[i].alias, proj4.defs(proj[i].code));
      }
    }
  }
  register(proj4);
  urlParams = mapOptions.params || {};
  settings.params = urlParams;
  settings.map = mapOptions.map;
  settings.url = mapOptions.url;
  settings.target = mapOptions.target;
  settings.baseUrl = mapOptions.baseUrl;
  settings.breakPoints = mapOptions.breakPoints;
  settings.extent = mapOptions.extent || undefined;
  settings.center = urlParams.center || mapOptions.center;
  settings.zoom = urlParams.zoom || mapOptions.zoom;
  settings.tileGrid = mapOptions.tileGrid || {};
  settings.tileSize = settings.tileGrid.tileSize ? [settings.tileGrid.tileSize, settings.tileGrid.tileSize] : [256, 256];
  settings.alignBottomLeft = settings.tileGrid.alignBottomLeft;

  if ('proj4Defs' in mapOptions || mapOptions.projectionCode === 'EPSG:3857' || mapOptions.projectionCode === 'EPSG:4326') {
    // Projection to be used in map
    settings.projectionCode = mapOptions.projectionCode || undefined;
    settings.projectionExtent = mapOptions.projectionExtent;
    settings.projection = new Projection({
      code: settings.projectionCode,
      extent: settings.projectionExtent,
      units: getUnits(settings.projectionCode)
    });
    settings.resolutions = mapOptions.resolutions || undefined;
    settings.tileGrid = maputils.tileGrid(settings);
  }

  settings.source = mapOptions.source;
  settings.groups = mapOptions.groups;
  settings.editLayer = mapOptions.editLayer;
  settings.styles = mapOptions.styles;
  settings.clusterOptions = mapOptions.clusterOptions || {};
  style().init();
  settings.controls = mapOptions.controls;
  settings.consoleId = mapOptions.consoleId || 'o-console';
  settings.featureinfoOptions = mapOptions.featureinfoOptions || {};
  settings.enableRotation = mapOptions.enableRotation !== false;

  loadMap();
  settings.layers = createLayers(mapOptions.layers, urlParams.layers);
  addLayers(settings.layers);

  elQuery(map, {
    breakPoints: mapOptions.breakPoints,
    breakPointsPrefix: mapOptions.breakPointsPrefix
  });

  if (urlParams.feature) {
    const featureId = urlParams.feature;
    const layer = getLayer(featureId.split('.')[0]);
    if (layer) {
      layer.once('render', () => {
        let feature;
        const type = layer.get('type');
        if (type === 'WFS') {
          feature = layer.getSource().getFeatureById(featureId);
        } else {
          feature = layer.getSource().getFeatureById(featureId.split('.')[1]);
        }

        if (feature) {
          const obj = {};
          obj.feature = feature;
          obj.title = layer.get('title');
          obj.content = getattributes(feature, layer);
          obj.layer = layer;

          const showOverlay = Object.prototype.hasOwnProperty.call(settings.featureinfoOptions, 'overlay') ? settings.featureinfoOptions.overlay : true;

          if (showOverlay) {
            featureinfo.identify([obj], 'overlay', getcenter(feature.getGeometry()));
          } else {
            featureinfo.identify([obj], 'sidebar', getcenter(feature.getGeometry()));
          }
          maputils.zoomToExent(feature.getGeometry(), getResolutions().length - 2);
        }
      });
    }
  }
  if (urlParams.pin) {
    settings.featureinfoOptions.savedPin = urlParams.pin;
  } else if (urlParams.selection) {
    settings.featureinfoOptions.savedSelection = new Feature({
      geometry: new geom[urlParams.selection.geometryType](urlParams.selection.coordinates)
    });
  }
  const makeClick = (coords) => {
    const coord = coords[0];
    const pixel = map.getPixelFromCoordinate(coord);
    const offsetX = parseFloat(urlParams.x, 10);
    const offsetY = parseFloat(urlParams.y, 10);
    const click = 'click';
    const clickEvent = new PointerEvent(click, {
      clientX: pixel[0] + offsetX,
      clientY: pixel[1] + offsetY
    });

    map.handleMapBrowserEvent(new MapBrowserPointerEvent(click, map, clickEvent));
    const singleClick = 'singleclick';
    const singleClickEvent = new PointerEvent(singleClick, {
      clientX: pixel[0] + offsetX,
      clientY: pixel[1] + offsetY
    });
  }
  if (urlParams.filter && urlParams.attribute && urlParams.value && urlParams.x && urlParams.y) {
    const lid = urlParams.filter.split(',').length > 0 ? urlParams.filter.split(',') : urlParams.filter;
    const att = urlParams.attribute;
    const pid = urlParams.value;
    const qf = `${att}='${pid}'`;
    const animationParameters = animation.getParams();
    settings.layers.forEach((layer) => {
      const name = layer.get('name');
      if (lid.includes(name)) {
        let tmp;
        if (layer.getSource().updateQuery) {
          tmp = layer.getSource().updateQuery(name, qf);
          layer.setSource(tmp);
        } else {
          tmp = layer.getSource().source.updateQuery(name, qf);
          layer.getSource().source = tmp;
        }

        setTimeout(() => {
          try {
            const features = tmp.getFeatures();
            const coords = [];
            if (features.length > 0) {
              if (features[0].get('geometry')) {
                features.forEach((feature) => {
                  const candidate = feature.getGeometry().getCoordinates();
                  const type = feature.getGeometry().getType();
                  if (type === 'Point') {
                    coords.push(candidate);
                  }
                });
              }
            }
            if (coords.length === 1) {
              const coord = coords[0];
              makeClick(coords);
              map.getView().animate({
                center: coord,
                zoom: animationParameters.zoom,
                duration: animationParameters.duration
              }, () => {
                makeClick(coords);
                dispatcher.emitToggleEdit('attribute');
              });
            } else if (coords.length > 1) {
              const poly = new Polygon([coords]);
              map.getView().fit(poly, { padding: [50, 50, 50, 50], constrainResolution: true, duration: 3000 });
            }
          } catch (error) {
            console.warn(error);
          }
        }, 1000);
      }
    });
  }
  if (urlParams.filter && urlParams.attribute && urlParams.value && !urlParams.x && !urlParams.y) {
    const lid = urlParams.filter.split(',').length > 0 ? urlParams.filter.split(',') : urlParams.filter;
    const att = urlParams.attribute;
    const pid = urlParams.value;
    const qf = `${att}='${pid}'`;
    const animationParameters = animation.getParams();
    settings.layers.forEach((layer) => {
      const name = layer.get('name');
      if (lid.includes(name)) {
        let tmp;
        if (layer.getSource().updateQuery) {
          tmp = layer.getSource().updateQuery(name, qf);
          layer.setSource(tmp);
        } else {
          tmp = layer.getSource().source.updateQuery(name, qf);
          layer.getSource().source = tmp;
          layer.set('title', titles[pid - 1]);
        }
        setTimeout(() => {
          try {
            const features = tmp.getFeatures();
            const coords = [];
            if (features.length > 0) {
              if (features[0].get('geometry')) {
                features.forEach((feature) => {
                  const candidate = feature.getGeometry().getCoordinates();
                  const type = feature.getGeometry().getType();
                  if (type === 'Point') {
                    coords.push(candidate);
                  }
                });
              }
            }
            if (coords.length === 1) {
              const coord = coords[0];
              const pixel = map.getPixelFromCoordinate(coord);
              const click = 'click';
              const clickEvent = new PointerEvent(click, {
                clientX: pixel[0],
                clientY: pixel[1]
              });

              map.handleMapBrowserEvent(new MapBrowserPointerEvent(click, map, clickEvent));
              const singleClick = 'singleclick';
              const singleClickEvent = new PointerEvent(singleClick, {
                clientX: pixel[0],
                clientY: pixel[1]
              });
              map.handleMapBrowserEvent(new MapBrowserPointerEvent(singleClick, map, singleClickEvent));
              map.getView().animate({
                center: coord,
                zoom: animationParameters.zoom,
                duration: animationParameters.duration
              }, () => {
                dispatcher.emitToggleEdit('attribute');
              });
            } else if (coords.length > 1) {
              const poly = new Polygon([coords]);
              map.getView().fit(poly, {
                padding: [50, 50, 50, 50],
                constrainResolution: true,
                zoom: animationParameters.zoom,
                duration: animationParameters.duration,
                callback: () => {
                  map.getView().animate({
                    zoom: map.getView().getZoom() + animationParameters.zoom2
                  });
                }
              });
            }
          } catch (error) {
            console.warn(error);
          }
        }, 1000);
      }
    });
  }
  featureinfo.init(settings.featureinfoOptions);
}

export default {
  init,
  createLayers,
  getBaseUrl,
  getBreakPoints,
  getExtent,
  getSettings,
  getStyleSettings,
  getMapUrl,
  getMap,
  getMapOptions,
  getLayers,
  getLayersByProperty,
  getLayer,
  getControlNames,
  getQueryableLayers,
  getSearchableLayers,
  getGroup,
  getGroups,
  getProjectionCode,
  getProjection,
  getMapSource,
  getResolutions,
  getScale,
  getTarget,
  getClusterOptions,
  getTileGrid,
  getTileSize,
  getTitles,
  setTitles,
  removeLayer,
  removeOverlays,
  checkScale,
  getMapName,
  getConsoleId,
  getUrl,
  getUrlParams
};
