import featureinfotemplates from './featureinfotemplates';
import replacer from './utils/replacer';
import geom from './geom';

function createUrl(prefix, suffix, url) {
  const p = prefix || '';
  const s = suffix || '';
  return p + url + s;
}

export default function (feature, layer) {
  const attributes = feature.getProperties();
  const geometryName = feature.getGeometryName();
  delete attributes[geometryName];
  let content = '<div class="o-identify-content"><ul>';
  let attribute;
  let li = '';
  let title;
  let val;
  // If layer is configured with attributes
  if (layer.get('attributes')) {
    // If attributes is string then use template named with the string
    if (typeof layer.get('attributes') === 'string') {
      // Use attributes with the template
      li = featureinfotemplates(layer.get('attributes'), attributes);
    } else {
      for (let i = 0; i < layer.get('attributes').length; i += 1) {
        attribute = layer.get('attributes')[i];
        title = '';
        val = '';
        if (attribute.name) {
          if (feature.get(attribute.name) !== undefined) {
            val = feature.get(attribute.name);
            if (attribute.title) {
              title = `<b>${attribute.title}</b>`;
            }
            if (attribute.url) {
              if (feature.get(attribute.url)) {
                const url = createUrl(attribute.urlPrefix, attribute.urlSuffix, replacer.replace(feature.get(attribute.url), feature.getProperties()));
                val = `<a href="${url}" target="_blank">
                ${feature.get(attribute.name)}
                </a>`;
              }
            }
          }
        } else if (attribute.url) {
          if (feature.get(attribute.url)) {
            const text = attribute.html || attribute.url;
            const url = createUrl(attribute.urlPrefix, attribute.urlSuffix, replacer.replace(feature.get(attribute.url), attributes));
            val = `<a href="${url}" target="_blank">
              ${text}
              </a>`;
          }
        } else if (attribute.img) {
          if (feature.get(attribute.img)) {
            const url = createUrl(attribute.urlPrefix, attribute.urlSuffix, replacer.replace(feature.get(attribute.img), attributes));
            const attribution = attribute.attribution ? `<div class="o-image-attribution">${attribute.attribution}</div>` : '';
            val = `<div class="o-image-container">
              <img src="${url}">${attribution}
              </div>`;
          }
        } else if (attribute.html) {
          val = replacer.replace(attribute.html, attributes, {
            helper: geom,
            helperArg: feature.getGeometry()
          });
        }

        if (attribute.isVisible === false) {
          attribute.cls = 'o-hidden';
        }

        const cls = ` class="${attribute.cls}" ` || '';

        li += `<li${cls}>${title}${val}</li>`;
      }
    }
  } else {
    // Use attributes with the template
    li = featureinfotemplates('default', attributes);
  }
  content += `${li}</ul></div>`;
  return content;
}
