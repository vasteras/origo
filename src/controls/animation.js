const params = {};
function init(opt) {
  params.zoom = opt.zoom;
  params.zoom2 = opt.zoom2;
  params.duration = opt.duration;
  params.offsetX = opt.offsetX;
  params.offsetY = opt.offsetY;
}
function getParams() {
  return params;
}

export default {
  init,
  getParams
};
