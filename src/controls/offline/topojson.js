import $ from 'jquery';
import TopoJSONFormat from 'ol/format/TopoJSON';
import verifyFeatureIds from './verifyfeatureids';

const topoJson = {
  createRequest: function createRequest(source) {
    const format = new TopoJSONFormat();
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
topoJson.request = function request(layer) {
  const source = layer.get('sourceName');
  const req = topoJson.createRequest(source);
  return req;
};

export default topoJson;
