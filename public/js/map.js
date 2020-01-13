import 'whatwg-fetch';

const L = require('mapbox.js');
const mapStyles = require('./mapStyles');
const config = require('../../frontendconfig.json');
const error = require('./error');

let map;
let startMarker;
let endMarker;
let path;
let initialCenter;

// Setup mapbox
L.mapbox.accessToken = config.mapboxAccessToken;
const MAPBOX_DATASETS_API = 'https://api.mapbox.com/datasets/v1/tahoebike';
const CONSTRUCTION_DATASET_ID = 'ck3pdyl2g5fn42tpnfsh5pibh';
const BIKE_PARKING_DATASET_ID = 'ck3pdz0lj0ezu2injv641rf8z';
const BIKE_SHOPS_DATASET_ID = 'ck3pdzfet26fm2ilhadvn614o';

// Setup layers
const class1Layer = L.mapbox.featureLayer();
const class1LayerOutline = L.mapbox.featureLayer();
const class2Layer = L.mapbox.featureLayer();
const class3Layer = L.mapbox.featureLayer();
const winterLayer = L.mapbox.featureLayer();
const bikeParkingLayer = L.mapbox.featureLayer();
const bikeShopsLayer = L.mapbox.featureLayer();
const constructionLayer = L.mapbox.featureLayer();

fetch('/data/class1.geojson')
.then((response) => response.json())
.then((json) => {
  class1LayerOutline.setGeoJSON(json)
  .setStyle({
    color: '#330066',
    weight: 3,
    opacity: 0.8,
  });
  class1Layer.setGeoJSON(json)
  .setStyle({
    color: '#fcf4db',
    weight: 1,
    opacity: 0.8,
  });
});

fetch('/data/class2.geojson')
.then((response) => response.json())
.then((json) => {
  class2Layer.setGeoJSON(json)
  .setStyle({
    color: '#660099',
    weight: 3,
    opacity: 0.8,
  });
});

fetch('/data/class3.geojson')
.then((response) => response.json())
.then((json) => {
  class3Layer.setGeoJSON(json)
  .setStyle({
    color: '#9933CC',
    weight: 3,
    opacity: 0.8,
    dashArray: '3,5'
  });
});



const fetchTrpaData = fetch('/data/trpaTrails.geojson')
  .then((response) => response.json())
  .then((json) => {
    // Only include trails with WNT_MAINT == 'YES'
    // Exclude trails with "MAINT_JURS" == "EL DORADO COUNTY" because they stopped plowing.
    // TODO update the dataset and remove this feature.
    const filteredFeatures = json.features
      .filter(feature => feature.properties.WNTR_MAINT === 'YES')
      .filter(feature => feature.properties.MAINT_JURS !== 'EL DORADO COUNTY')
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
      color: '#ff0000',
      weight: 3,
      opacity: 0.8,
      dashArray: '3,5'
    });
})

function createIconLayer(layer, datasetId, style, formattingFunction) {
  const endpoint = `${MAPBOX_DATASETS_API}/${datasetId}/features?access_token=${config.mapboxAccessToken}`;
  fetch(endpoint)
  .then((response) => response.json())
  .then((geojson) => {
    if (!geojson) {
      error.handleError(new Error(`Unable to fetch data for dataset id ${datasetId}`));
      return;
    }
    layer.on('layeradd', (e) => {
      e.layer.setIcon(L.icon(style));
      if (formattingFunction) {
        e.layer.bindPopup(formattingFunction(e.layer.feature.properties));
      }
    });
    layer.setGeoJSON(geojson);
  });
}


function createBikeParkingLayer() {
  createIconLayer(
    bikeParkingLayer,
    BIKE_PARKING_DATASET_ID,
    mapStyles.bikeParkingIconStyle,
    null,
  );
}

function formatBikeShopsPopup(properties) {
  // Previously we showed less info for bike shops that are not LTBC Business Members
  // But no shops have renewed their membership recently (as of late 2019)
  // So lets show as much info as we have for each shop
  // if (!properties['business_member']) {
  //   return `<b>${properties.name}</b>`;
  // }

  let textContent = properties.name ? `<b>${properties.name}</b>` : 'Unknown Bike Shop';
  if (properties.business_member) {
    textContent += `<br />LTBC Business Member`
  }
  if (properties.address) {
    textContent += `<br />${properties.address}`
  }
  if (properties.phone_number) {
    textContent += `<br />${properties.phone_number}`
  }
  if (properties.website) {
    textContent += `<br /><a href="${properties.website}" target="_blank">${properties.website}</a>`
  }
  
  return textContent;
}

function createBikeShopLayer() {
  createIconLayer(
    bikeShopsLayer,
    BIKE_SHOPS_DATASET_ID,
    mapStyles.bikeShopsIconStyle,
    formatBikeShopsPopup,
  );
}

function formatConstructionPopup(properties) {
  const disclaimer = 'Construction notices provided by map users. Note that less recent notices may be out of date, and require confirmation.';
  return `
    <h2>${properties.title}</h2>
    <p>${properties.description}</p>
    <small>
    ${properties.last_updated ? (`Last Updated: ${properties.last_updated}`) : ''}
    <br />
    ${disclaimer}
    </small>
  `;
}

function createConstructionLayer() {
  createIconLayer(
    constructionLayer,
    CONSTRUCTION_DATASET_ID,
    mapStyles.constructionIconStyle,
    formatConstructionPopup,
  );
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
    color: '#ff6712',
    opacity: 0.8,
    width: 5,
    dashArray: '6, 12',
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
  class1LayerOutline.addTo(map);
  class2Layer.addTo(map);
  class3Layer.addTo(map);
  constructionLayer.addTo(map);
  winterLayer.addTo(map);
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
    layers = [class1LayerOutline, class1Layer];
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
