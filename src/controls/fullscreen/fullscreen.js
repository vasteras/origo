import $ from 'jquery';
import utils from '../../utils';
import permalink from '../../permalink/permalink';
import isEmbedded from '../../utils/isembedded';
import viewer from '../../viewer';
import Modify from './options/Modify';

let tooltip;
let mapTarget;
let notOnlyEmbedded;
let modify;

function goFullScreen() {
  const url = permalink.getPermalink();
  if (modify) {
    modify.setParams = url.split('#')[1];
    if (modify.isReady) {
      modify.init();
    }
  }
}

function render(target) {
  const el = utils.createButton({
    id: 'o-fullscreen-button',
    cls: 'o-fullscreen-button',
    iconCls: 'o-icon-fa-expand',
    src: '#fa-expand',
    tooltipText: tooltip,
    tooltipPlacement: 'east'
  });

  if (isEmbedded(mapTarget) && !notOnlyEmbedded) {
    $(target).append(el);
  } else if (!isEmbedded(mapTarget) && notOnlyEmbedded) {
    $(target).append(el);
  } else if (isEmbedded(mapTarget)) {
    const m = document.getElementById('o-map').getBoundingClientRect();
    const z = document.querySelector('.ol-zoom').getBoundingClientRect();
    if (Math.abs(z.top - m.top) > 100) {
      $(target).append(el);
    } else {
      $(target).prepend(el);
    }
  }
}

function bindUIActions() {
  $('#o-fullscreen-button button').click((e) => {
    try {
      goFullScreen();
      $('#o-fullscreen-button button').blur();
      e.preventDefault();
    } catch (error) {
      console.error(error);
    }
  });
}

function init(optOptions) {
  const options = optOptions || {};
  const target = options.target || '#o-toolbar-misc';
  mapTarget = viewer.getTarget();
  tooltip = options.tooltipText || 'Visa stor karta';
  notOnlyEmbedded = options.notOnlyEmbedded || false;
  const {
    appUrl,
    config,
    translate,
    field,
    expect,
    cleaner
  } = options;
  try {
    modify = new Modify({
      appUrl,
      field,
      config,
      translate,
      expect,
      cleaner
    });
  } catch (error) {
    console.error(error);
  }
  render(target);
  bindUIActions();
}

export default { init };
