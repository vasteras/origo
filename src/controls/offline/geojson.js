import $ from 'jquery';
import GeoJSONFormat from 'ol/format/GeoJSON';
import verifyFeatureIds from './verifyfeatureids';

const geojson = {
  createRequest: function createRequest(source) {
    const format = new GeoJSONFormat();
    const url = source;

    return $.ajax({
      url,
      cache: false
    })
      .then((response) => {
        let features = format.readFeatures(response);
        features = verifyFeatureIds(features);
        return features;
      });
  }
};
geojson.request = function request(layer) {
  const source = layer.get('sourceName');
  const req = geojson.createRequest(source);
  return req;
};

export default geojson;
