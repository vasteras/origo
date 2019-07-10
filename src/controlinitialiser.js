import origo from '../origo';

const initControlNames = [];
const init = (controls) => {
  let controlName;
  let controlOptions;
  controls.forEach((control) => {
    controlName = control.name;
    controlOptions = control.options || undefined;
    if (Object.prototype.hasOwnProperty.call(origo.controls, controlName)) {
      initControlNames.push(controlName);
      if (controlOptions) {
        origo.controls[controlName].init(controlOptions);
      } else {
        origo.controls[controlName].init();
      }
    }
  });
};
function getInitControls() {
  return initControlNames;
}
export default {
  init,
  getInitControls
};
