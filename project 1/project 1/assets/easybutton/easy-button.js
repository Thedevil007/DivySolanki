(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['leaflet'], factory);
  } else if (typeof module !== 'undefined') {
    module.exports = factory(require('leaflet'));
  } else {
    factory(window.L);
  }
})(function (L) {
  if (typeof L === 'undefined') {
    throw new Error('Leaflet must be loaded first');
  }

  L.Control.EasyButton = L.Control.extend({
    options: {
      position: 'topright',
      id: '',
      type: 'button',
      leafletClasses: true,
      states: [],
      style: 'leaflet-bar',
      className: 'easy-button-button',
      label: '',
      title: '',
      onClick: function () {},
      toggle: false,
      disabled: false
    },

    initialize: function (options) {
      L.setOptions(this, options);
      this._createButton();
    },

    onAdd: function (map) {
      this._map = map;
      return this._btn;
    },

    _createButton: function () {
      const container = this._btn = L.DomUtil.create('button', this.options.className);
      if (this.options.leafletClasses) {
        L.DomUtil.addClass(container, 'leaflet-bar leaflet-interactive');
      }
      container.type = this.options.type;
      if (this.options.id) container.id = this.options.id;
      container.innerHTML = this.options.label;
      if (this.options.title) container.title = this.options.title;

      L.DomEvent.on(container, 'click', this._clicked, this);
    },

    _clicked: function (e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      if (this.options.disabled) return;
      this.options.onClick(this, this._map);
    },

    disable: function () {
      this.options.disabled = true;
      L.DomUtil.addClass(this._btn, 'easy-button-disabled');
    },

    enable: function () {
      this.options.disabled = false;
      L.DomUtil.removeClass(this._btn, 'easy-button-disabled');
    }
  });

  L.easyButton = function (iconClass, onClick, title, map) {
    return new L.Control.EasyButton({
      label: `<i class="fa ${iconClass}"></i>`,
      onClick,
      title
    }).addTo(map);
  };
});
