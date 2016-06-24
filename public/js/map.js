const config = require('../../frontendconfig.json');
const error = require('./error');

import 'whatwg-fetch';

let map;
let startMarker;
let endMarker;
let path;

const L = require('mapbox.js');

// Setup mapbox
L.mapbox.accessToken = config.mapboxAccessToken;

// Add polyline distance function
L.Polyline = L.Polyline.extend({
  getDistance: function getDistance() {
    // distance in meters
    let distance = 0;
    const length = this._latlngs.length;
    for (let i = 1; i < length; i++) {
      distance += this._latlngs[i].distanceTo(this._latlngs[i - 1]);
    }
    return distance;
  },
});

// Setup class layers
const class1Layer = L.mapbox.featureLayer();
const class2Layer = L.mapbox.featureLayer();
const class3Layer = L.mapbox.featureLayer();
const bikeParkingLayer = L.layerGroup();
const bikeStoresLayer = L.layerGroup();
const constructionLayer = L.layerGroup();

fetch('/data/class1.geojson')
.then((response) => response.json())
.then((json) => {
  class1Layer.setGeoJSON(json);
  class1Layer.setStyle({
    color: '#2ca25f',
    weight: 3,
  });
});

fetch('/data/class2.geojson')
.then((response) => response.json())
.then((json) => {
  class2Layer.setGeoJSON(json);
  class2Layer.setStyle({
    color: '#c994c7',
    weight: 3,
  });
});

fetch('/data/class3.geojson')
.then((response) => response.json())
.then((json) => {
  class3Layer.setGeoJSON(json);
  class3Layer.setStyle({
    color: '#ff6600',
    weight: 3,
  });
});


function createBikeParkingLayer() {
  const bikeParkingLayerTableId = '1KeuYN2D5EQMkah2TKCrm8gOfTqHCpTuRMi1JwCkK';
  fetch(`https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%20${bikeParkingLayerTableId}&key=${config.googleMapsApiKey}`)
  .then((response) => response.json())
  .then((json) => {
    if (!json || !json.rows) {
      error.handleError(new Error('Unable to fetch bike rack data'));
      return;
    }

    json.rows.forEach((point) => {
      const bikeRackIcon = L.divIcon({
        className: 'bike-rack-icon',
        iconSize: [20, 20],
       });

      L.marker([parseFloat(point[0]), parseFloat(point[1])], { icon: bikeRackIcon }).addTo(bikeParkingLayer);
    });
  });
}

function formatBikeStorePopup(store) {
  const website = store[4] ? `<a href="http://${store[4]}" target="_blank">${store[4]}</a>` : '';
  return `<b>${store[0]}</b><br>${store[1]}<br>${website}`;
}

function createBikeStoreLayer() {
  const bikeStoresLayerTableId = '1Jlh83cf0VSIAqPiPd3QRaI-EFrpvl5zWl53PBDi0';
  fetch(`https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%20${bikeStoresLayerTableId}&key=${config.googleMapsApiKey}`)
  .then((response) => response.json())
  .then((json) => {
    if (!json || !json.rows) {
      error.handleError(new Error('Unable to fetch bike store data'));
      return;
    }

    json.rows.forEach((store) => {
      const bikeStoreIcon = L.divIcon({
        className: 'bike-store-icon',
        iconSize: [24, 24],
      });

      L.marker([parseFloat(store[2]), parseFloat(store[3])], { icon: bikeStoreIcon })
      .bindPopup(formatBikeStorePopup(store))
      .addTo(bikeStoresLayer);
    });
  });
}

function formatConstructionPopup(item) {
  return `<p>${item[0]}</p><small>Added: ${item[3]}`;
}

function createConstructionLayer() {
  const bikeConstructionLayerTableId = '1lYIV19mk2ztU2lL-7U68NFC04l352mxLg7Klo_v7';
  fetch(`https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%20${bikeConstructionLayerTableId}&key=${config.googleMapsApiKey}`)
  .then((response) => response.json())
  .then((json) => {
    if (!json || !json.rows) {
      error.handleError(new Error('Unable to fetch construction data'));
      return;
    }

    const constructionIcon = L.divIcon({
      className: 'construction-icon',
      iconSize: [24, 24],
    });

    json.rows.forEach((item) => {
      L.marker([parseFloat(item[1]), parseFloat(item[2])], { icon: constructionIcon })
      .bindPopup(formatConstructionPopup(item))
      .addTo(constructionLayer);
    });
  });
}

exports.drawMap = (center, zoom, handleMapClick, handleMarkerDrag) => {
  map = L.mapbox.map('map', 'mapbox.streets', {
    center,
    zoom,
  });

  startMarker = L.marker(center, {
    draggable: true,
    icon: L.mapbox.marker.icon({
      'marker-size': 'large',
      'marker-symbol': 's',
      'marker-color': '#19b566',
    }),
  });

  endMarker = L.marker(center, {
    draggable: true,
    icon: L.mapbox.marker.icon({
      'marker-size': 'large',
      'marker-symbol': 'e',
      'marker-color': '#cf3043',
    }),
  });

  path = L.polyline([center, center], { color: '#4812ff' });

  map.on('click', (event) => {
    handleMapClick(event.latlng);
  });

  startMarker.on('dragend', (event) => {
    const marker = event.target;
    handleMarkerDrag(marker.getLatLng(), 'start');
  });

  endMarker.on('dragend', (event) => {
    const marker = event.target;
    handleMarkerDrag(marker.getLatLng(), 'end');
  });

  createBikeStoreLayer();
  createBikeParkingLayer();
  createConstructionLayer();

  class1Layer.addTo(map);
  class2Layer.addTo(map);
  class3Layer.addTo(map);
  constructionLayer.addTo(map);
};

exports.updateStartMarker = (latlng) => {
  if (latlng) {
    startMarker.setLatLng(latlng).addTo(map);
  } else {
    map.removeLayer(startMarker);
  }
};

exports.updateEndMarker = (latlng) => {
  if (latlng) {
    endMarker.setLatLng(latlng).addTo(map);
  } else {
    map.removeLayer(endMarker);
  }
};

exports.updatePath = (decodedPath) => {
  if (!decodedPath) {
    map.removeLayer(path);
  } else {
    path.setLatLngs(decodedPath).addTo(map);
  }
};

exports.destroyMap = () => {
  if (map) {
    map.remove();
    map = undefined;
  }
};

exports.latlngIsWithinBounds = (latlng) => {
  const isWithinBounds = latlng.lat <= config.boundsTop && latlng.lat >= config.boundsBottom && latlng.lng <= config.boundsRight && latlng.lng >= config.boundsLeft;
  if (!isWithinBounds) {
    alert('This tool only works for the Lake Tahoe region.');
  }

  return isWithinBounds;
};

exports.toggleLayer = (layerName, show) => {
  let layer;
  if (layerName === 'class1') {
    layer = class1Layer;
  } else if (layerName === 'class2') {
    layer = class2Layer;
  } else if (layerName === 'class3') {
    layer = class3Layer;
  } else if (layerName === 'bikeParking') {
    layer = bikeParkingLayer;
  } else if (layerName === 'bikeStores') {
    layer = bikeStoresLayer;
  } else if (layerName === 'construction') {
    layer = constructionLayer;
  } else {
    error.handleError(new Error('Unable to find layer specified'));
    return;
  }

  if (show) {
    layer.addTo(map);
  } else {
    map.removeLayer(layer);
  }
};

exports.getPathDistance = (decodedPath) => {
  return L.polyline(decodedPath).getDistance();
};
