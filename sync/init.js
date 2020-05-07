function init() {
  console.log('init');
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener('readystatechange', () => {
    if (this.readyState === 4) {
      console.log('readyState 4');
      console.log(this.responseText);
    }
  });

  xhr.open('GET', 'https://kartor.vasteras.se/arcgis/rest/services/ext/webbobjekt_dyn/FeatureServer/0/query?f=json&outFields=pageid');
  xhr.send();
}

init();
