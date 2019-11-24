const config = require('../../frontendconfig.json');
const error = require('./error');

import 'whatwg-fetch';

let map;
let startMarker;
let endMarker;
let path;
let initialCenter;

const L = require('mapbox.js');

// Setup mapbox
L.mapbox.accessToken = config.mapboxAccessToken;

// Setup layers
const class1Layer = L.mapbox.featureLayer();
const class2Layer = L.mapbox.featureLayer();
const class3Layer = L.mapbox.featureLayer();
const winterLayer = L.mapbox.featureLayer();
const bikeParkingLayer = L.layerGroup();
const bikeShopsLayer = L.layerGroup();
const constructionLayer = L.layerGroup();

fetch('/data/class1.geojson')
.then((response) => response.json())
.then((json) => {
  class1Layer.setGeoJSON(json)
  .setStyle({
    color: '#8ec733',
    weight: 4,
    opacity: 1,
  });
});

fetch('/data/class2.geojson')
.then((response) => response.json())
.then((json) => {
  class2Layer.setGeoJSON(json)
  .setStyle({
    color: '#f7a745',
    weight: 4,
    opacity: 1,
  });
});

fetch('/data/class3.geojson')
.then((response) => response.json())
.then((json) => {
  class3Layer.setGeoJSON(json)
  .setStyle({
    color: '#f7a745',
    weight: 2,
    opacity: 1,
  });
});



const fetchTrpaData = fetch('/data/trpaTrails.geojson')
  .then((response) => response.json())
  .then((json) => {
    // Only include trails with WNT_MAINT == 'YES'
    const filteredFeatures = json.features.filter(feature => feature.properties.WNTR_MAINT === 'YES')
    const nextJson = Object.assign({}, json);
    nextJson.features = filteredFeatures;
    return Promise.resolve(nextJson);
  });

const fetchTruckeeData = fetch('/data/truckeeTrails.geojson')
  .then((response) => response.json())
  .then((json) => {
    // Only include trails with CLASS == "I", and MAINTBY == "Town of Truckee"
    // "The trails that we plow in the winter are only those Class I paved trails managed by the Town" - Sarah Kunnen, Engineering Technician, Town Of Truckee
    const filteredFeatures = json.features.filter(({ properties }) => (properties.CLASS === 'I' && properties.MAINTBY == 'Town of Truckee'))
    const nextJson = Object.assign({}, json);
    nextJson.features = filteredFeatures;
    return Promise.resolve(nextJson);

  });

// combinedData is an array of GeoJSON objects
Promise.all([fetchTrpaData, fetchTruckeeData]).then(combinedData => {
  winterLayer.setGeoJSON(combinedData)
    .setStyle({
      color: '#5b8844',
      weight: 4,
      opacity: 1,
      dashArray: '10,10',
      lineCap: 'butt',
    });
})


function createBikeParkingLayer() {
  const bikeParkingLayerTableId = '1KeuYN2D5EQMkah2TKCrm8gOfTqHCpTuRMi1JwCkK';
  fetch(`https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%20${bikeParkingLayerTableId}&key=${config.googleFusionTablesApiKey}`)
  .then((response) => response.json())
  .then((json) => {
    if (!json) {
      error.handleError(new Error('Unable to fetch bike rack data'));
      return;
    }

    if (!json.rows) {
      // No data for this table
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
  if (shop[1] !== 'LTBC Business Member') {
    return `<b>${shop[0]}</b>`;
  }

  const website = shop[5] ? `<a href="${shop[5]}" target="_blank">${shop[5]}</a>` : '';
  return `<b>${shop[0]}</b><br>LTBC Business Member<br>${shop[2]}<br>${shop[6]}<br>${website}`;
}

function createBikeShopLayer() {
  const bikeShopsLayerTableId = '1Jlh83cf0VSIAqPiPd3QRaI-EFrpvl5zWl53PBDi0';
  fetch(`https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%20${bikeShopsLayerTableId}&key=${config.googleFusionTablesApiKey}`)
  .then((response) => response.json())
  .then((json) => {
    if (!json) {
      error.handleError(new Error('Unable to fetch bike shop data'));
      return;
    }

    if (!json.rows) {
      // No data for this table
      return;
    }

    json.rows.forEach((shop) => {
      const bikeShopIcon = L.divIcon({
        className: 'bike-shop-icon',
        iconSize: [24, 24],
      });

      L.marker([parseFloat(shop[3]), parseFloat(shop[4])], { icon: bikeShopIcon })
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
  fetch(`https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%20${bikeConstructionLayerTableId}&key=${config.googleFusionTablesApiKey}`)
  .then((response) => response.json())
  .then((json) => {
    if (!json) {
      error.handleError(new Error('Unable to fetch construction data'));
      return;
    }

    if (!json.rows) {
      // No data for this table
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

exports.drawMap = (center, zoom, minZoom, draggable, handleMapClick, handleMarkerDrag, handleMapZoom) => {
  initialCenter = center;
  // https://docs.mapbox.com/mapbox.js/api/v3.2.0/l-mapbox-map/
  map = L.mapbox.map(
    'map', // DOM element ID
    null,
    {
      center,
      zoom,
      minZoom,
    },
  );
  L.mapbox.styleLayer(
    'mapbox://styles/tahoebike/ck3cbc5z81vr71clhw1rfylmy',
    {
      accessToken: config.mapboxAccessToken,
    },
  ).addTo(map);

  startMarker = L.marker(center, {
    draggable,
    icon: L.mapbox.marker.icon({
      'marker-size': 'large',
      'marker-symbol': 's',
      'marker-color': '#19b566',
    }),
  });

  endMarker = L.marker(center, {
    draggable: draggable,
    icon: L.mapbox.marker.icon({
      'marker-size': 'large',
      'marker-symbol': 'e',
      'marker-color': '#cf3043',
    }),
  });

  path = L.polyline([center, center], {
    color: '#000000',
    opacity: 0.3,
    weight: 15,
  });

  map.on('click', (event) => {
    handleMapClick(event.latlng);
  });

  map.on('zoom', (event) => {
    handleMapZoom(map.getZoom());
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
  // Uncomment to add winterlayer by default:
  // winterLayer.addTo(map);
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
    path.setLatLngs([initialCenter, initialCenter]);
  } else {
    path.setLatLngs(decodedPath).addTo(map);
    path.bringToBack();
    map.fitBounds(path.getBounds(), { padding: [30, 30] });
  }
};

exports.latlngIsWithinBounds = (latlng, type) => {
  const isWithinBounds = latlng.lat <= config.boundsTop && latlng.lat >= config.boundsBottom && latlng.lng <= config.boundsRight && latlng.lng >= config.boundsLeft;
  if (!isWithinBounds) {
    let alertText = 'This tool only works for the Lake Tahoe region.';
    if (type === 'start') {
      alertText += ' Change your start address and try again.';
    } else if (type === 'end') {
      alertText += ' Change your end address and try again.';
    }

    alert(alertText);
  }

  return isWithinBounds;
};

exports.toggleLayer = (layerName, show) => {
  let layers;
  if (layerName === 'class1') {
    layers = [class1Layer];
  } else if (layerName === 'class2') {
    layers = [class2Layer];
  } else if (layerName === 'class3') {
    layers = [class3Layer];
  } else if (layerName === 'bikeParking') {
    layers = [bikeParkingLayer];
  } else if (layerName === 'bikeShops') {
    layers = [bikeShopsLayer];
  } else if (layerName === 'construction') {
    layers = [constructionLayer];
  } else if (layerName === 'winter') {
    layers = [winterLayer];
  } else {
    error.handleError(new Error('Unable to find layer specified'));
    return;
  }

  if (show) {
    for (const layer of layers) {
      layer.addTo(map);
    }
  } else {
    for (const layer of layers) {
      map.removeLayer(layer);
    }
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

exports.updateMapSize = () => {
  map.invalidateSize();
};

exports.panTo = (latlng) => {
  map.panTo(latlng);

  if (map.getZoom() > 11) {
    map.setZoom(11);
  }
}
