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

// Setup layers
const class1Layer = L.mapbox.featureLayer();
const class2Layer = L.mapbox.featureLayer();
const class3Layer = L.mapbox.featureLayer();
const bikeParkingLayer = L.layerGroup();
const bikeShopsLayer = L.layerGroup();
const constructionLayer = L.layerGroup();

fetch('/data/class1.geojson')
.then((response) => response.json())
.then((json) => {
  class1Layer.setGeoJSON(json)
  .setStyle({
    color: '#003366',
    weight: 3,
    opacity: 1,
  });
});

fetch('/data/class2.geojson')
.then((response) => response.json())
.then((json) => {
  class2Layer.setGeoJSON(json)
  .setStyle({
    color: '#0066CC',
    weight: 3,
    opacity: 0.8,
  });
});

fetch('/data/class3.geojson')
.then((response) => response.json())
.then((json) => {
  class3Layer.setGeoJSON(json)
  .setStyle({
    color: '#3399FF',
    weight: 3,
    opacity: 0.6,
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

      L.marker([parseFloat(point[0]), parseFloat(point[1])], { icon: bikeRackIcon })
      .addTo(bikeParkingLayer);
    });
  });
}

function formatBikeShopPopup(shop) {
  const website = shop[4] ? `<a href="http://${shop[4]}" target="_blank">${shop[4]}</a>` : '';
  return `<b>${shop[0]}</b><br>${shop[1]}<br>${website}`;
}

function createBikeShopLayer() {
  const bikeShopsLayerTableId = '1Jlh83cf0VSIAqPiPd3QRaI-EFrpvl5zWl53PBDi0';
  fetch(`https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%20${bikeShopsLayerTableId}&key=${config.googleMapsApiKey}`)
  .then((response) => response.json())
  .then((json) => {
    if (!json || !json.rows) {
      error.handleError(new Error('Unable to fetch bike shop data'));
      return;
    }

    json.rows.forEach((shop) => {
      const bikeShopIcon = L.divIcon({
        className: 'bike-shop-icon',
        iconSize: [24, 24],
      });

      L.marker([parseFloat(shop[2]), parseFloat(shop[3])], { icon: bikeShopIcon })
      .bindPopup(formatBikeShopPopup(shop))
      .addTo(bikeShopsLayer);
    });
  });
}

function formatConstructionPopup(item) {
  const disclaimer = 'Construction notices provided by map users. Note that less recent notices may be out of date, and require confirmation.';
  return `<p>${item[0]}</p><small>Added: ${item[3]}<br>${disclaimer}`;
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
  map = L.map('map', {
    center,
    zoom,
    attributionControl: false,
  });

  L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=${config.mapboxAccessToken}`).addTo(map);

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

  createBikeShopLayer();
  createBikeParkingLayer();
  createConstructionLayer();

  class1Layer.addTo(map);
  class2Layer.addTo(map);
  class3Layer.addTo(map);
  constructionLayer.addTo(map);

  // Attribution and disclaimer
  L.control.attribution({
    position: 'bottomright',
  })
  .addAttribution('© <a href="https://www.mapbox.com/about/maps/"">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>')
  .addTo(map);
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
    map.fitBounds(path.getBounds(), { padding: [30, 30] });
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
  } else if (layerName === 'bikeShops') {
    layer = bikeShopsLayer;
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
  // Returns distance in meters
  const polyline = L.polyline(decodedPath);

  let distance = 0;
  const length = polyline._latlngs.length;
  for (let i = 1; i < length; i++) {
    distance += polyline._latlngs[i].distanceTo(polyline._latlngs[i - 1]);
  }
  return distance;
};
