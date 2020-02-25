# Tahoe Bike Map

This is a web app for finding efficient bike routes around the Lake Tahoe region. See it in action at http://map.tahoebike.org.

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

## Deployment

* This app is deployed through Heroku. Credentials are stored in the LTBC LastPass Account.
* Install the Heroku CLI locally: `brew install heroku/brew/heroku`
* `heroku login`
* From the repo, `git remote add prod https://git.heroku.com/tahoebike.git && git remote add staging https://git.heroku.com/tahoebike-stage.git`
* `git push staging|prod [localbranchname:]master`
* `heroku logs --tail -a tahoebike[stage]`
* `heroku run bash --remote staging|prod`

## Contributing

Contributions welcome. Contact [Nick Speal](http://www.speal.ca/contact/) to get involved with the [Lake Tahoe Bicycle Coalition](https://wwww.tahoebike.org)

## Credit

Originally developed by [Brendan Nee](https://github.com/brendannee) at [BlinkTag](https://blinktag.com/). Maintained by Nick Speal(https://github.com/nickspeal/) and the [Lake Tahoe Bicycle Coalition](https://wwww.tahoebike.org)
