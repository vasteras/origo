import 'whatwg-fetch';
import $ from 'jquery';
import EsriJSON from 'ol/format/EsriJSON';
import VectorSource from 'ol/source/Vector';
import * as loadingstrategy from 'ol/loadingstrategy';
import viewer from '../viewer';
import vector from './vector';

function serialize(params) {
  return Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
}

function serializeGeometry(extent, wkid) {
  return JSON.stringify({
    xmin: extent[0],
    ymin: extent[1],
    xmax: extent[2],
    ymax: extent[3],
    spatialReference: {
      wkid
    }
  });
}

function parseWKID(options) {
  return parseInt(options.projectionCode.split(':').pop(), 10);
}

function encodeQuery(params) {
  return encodeURI([`/query?${serialize(params)}`].join(''));
}

// TODO: Add support for all Geometry objects.
// https://developers.arcgis.com/documentation/common-data-types/geometry-objects.htm
// Both geometryType and geomtery needs to be updated.
// https://developers.arcgis.com/rest/services-reference/distance.htm
// sourceOptions.geometryType = agsOptions.geometryType;
// TODO: Handle geomoetryTypes.
// agsOptions.geomtryType Gets Polygon, Point, LineString
// but AGS REST supports Point, Multipoint, Polyline, Polygon, Envelope

function createESRIUrl(options, extent, queryFilter) {
  const url = options.url;
  const id = options.id;
  const filter = queryFilter || options.filter;

  const sr = parseWKID(options);
  const params = {
    f: options.f || 'json',
    returnGeometry: options.returnGeometry || true,
    spatialRel: options.spatialRel || 'esriSpatialRelIntersects',
    geometryType: 'esriGeometryEnvelope',
    returnIdsOnly: options.returnIdsOnly || false,
    returnCountOnly: options.returnCountOnly || false,
    geometryPrecision: options.geomtryPrecision || 2,
    outFields: options.outFields || '*',
    geometry: serializeGeometry(extent, sr),
    inSR: sr,
    outSR: sr,
    where: filter
  };
  return url + id + encodeQuery(params);
}

function loadData(url, projection, that) {
  fetch(url).then(response => response.json()).then((data) => {
    const features = new EsriJSON().readFeatures(data, {
      featureProjection: projection
    });
    if (features.length > 0) {
      that.addFeatures(features);
    }
  }).catch(error => console.warn(error));
}
const filters = [];
function createSource(options) {
  if (options.filter) {
    filters.push({
      name: options.name,
      filter: options.filter
    });
  }
  const vectorSource = new VectorSource({
    attributions: options.attribution,
    loader(extent, resolution, projection) {
      const that = this;
      const url = createESRIUrl(options, extent);
      loadData(url, projection, that);
    },
    strategy: loadingstrategy.bbox
  });
  vectorSource.updateQuery = (name, query) => new VectorSource({
    attributions: options.attribution,
    loader(extent, resolution, projection) {
      const that = this;
      let q;
      const getFilter = filters.filter(f => f.name === name)[0] || '';
      if (getFilter !== '') {
        q = `${getFilter.filter} AND ${query}`;
      } else {
        q = query;
      }
      const url = createESRIUrl(options, extent, q);
      loadData(url, projection, that);
    },
    strategy: loadingstrategy.bbox
  });
  return vectorSource;
}

const agsFeature = function agsFeature(layerOptions) {
  const agsDefault = {
    layerType: 'vector'
  };
  const sourceDefault = {};
  const agsOptions = $.extend(agsDefault, layerOptions);
  const sourceOptions = $.extend(sourceDefault, viewer.getMapSource()[layerOptions.sourceName]);
  sourceOptions.name = layerOptions.name;
  sourceOptions.geometryName = agsOptions.geometryName;
  sourceOptions.filter = agsOptions.filter;
  sourceOptions.attribution = agsOptions.attribution;
  sourceOptions.projectionCode = viewer.getProjectionCode();
  sourceOptions.id = agsOptions.id;
  sourceOptions.f = agsOptions.f;
  sourceOptions.returnGeometry = agsOptions.returnGeometry;
  sourceOptions.spatialRel = agsOptions.spatialRel;
  sourceOptions.returnIdsOnly = agsOptions.returnIdsOnly;
  sourceOptions.returnCountOnly = agsOptions.returnCountOnly;
  sourceOptions.geometryPrecision = agsOptions.geomtryPrecision;
  sourceOptions.outFields = agsOptions.outFields;

  const agsSource = createSource(sourceOptions);

  return vector(agsOptions, agsSource);
};

export default agsFeature;
