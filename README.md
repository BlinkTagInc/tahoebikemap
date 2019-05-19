# Tahoe Bike Map

This is a web app for finding efficient bike routes around the Lake Tahoe region. See it in action at http://map.biketahoe.org.

It allows users to specify a start and end point to a route and allows them to choose a route type. The route type can be one biased towards bike routes and bike lanes or a more direct route.

Bike routes are provided by the [Bikesy Server](https://github.com/brendannee/bikesy-server). The maps are rendered using the mapbox API and allow dragging and dropping start/end points.

The assumptions that go into the routes provided by the Bikesy API are documented on the [Bikesy API page](https://blog.bikesy.com/api/).

## Setup

Install node.js dependencies

    npm install

## Running Locally

To run locally:

    npm run develop

Then, open http://localhost:3000 in your browser. Gulp will listen for changes and reload automatically.

## Running in Production

    npm run build

    npm start
