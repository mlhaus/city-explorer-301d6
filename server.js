'use strict';

// Application Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(cors());

// Route Definitions
app.get('/', rootHandler);
app.get('/location', locationHandler);
app.get('/yelp', restaurantHandler);
app.get('/weather', weatherHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);

// Route Handlers
function rootHandler(request, response) {
  response.status(200).send('City Explorer back-end');
}

const locationCache = {};

function getLocationFromCache(city) {
  return locationCache[city];
}

function setLocationInCache(city, location) {
  locationCache[city] = location;
}

function locationHandler(request, response) {
  const city = request.query.city.toLowerCase().trim();
  const locationFromCache = getLocationFromCache(city);
  if(locationFromCache) {
    response.send(locationFromCache);
    return;
  }
  const url = 'https://us1.locationiq.com/v1/search.php';
  superagent.get(url)
    .query({
      key: process.env.LOCATION_KEY,
      q: city,
      format: 'json'
    })
    .then(locationIQResponse => {
      const topLocation = locationIQResponse.body[0];
      const myLocationResponse = new Location(city, topLocation);
      setLocationInCache(city, myLocationResponse);
      response.status(200).send(myLocationResponse);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

function restaurantHandler(request, response) {
  const lat = parseFloat(request.query.latitude);
  const lon = parseFloat(request.query.longitude);
  const currentPage = request.query.page;
  const numPerPage = 4;
  const start = ((currentPage - 1) * numPerPage + 1);
  const url = 'https://api.yelp.com/v3/businesses/search';
  superagent.get(url)
    .query({
      latitude: lat,
      longitude: lon,
      limit: numPerPage,
      offset: start
    })
    .set('Authorization', `Bearer ${process.env.YELP_KEY}`)
    .then(yelpResponse => {
      const arrayOfRestaurants = yelpResponse.body.businesses;
      const restaurantsResults = [];
      arrayOfRestaurants.forEach(restaurantObj => {
        restaurantsResults.push(new Restaurant(restaurantObj));
      });
      response.send(restaurantsResults);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

const forecastCache = {};

function getForecastsFromCache(city) {
  console.log('Current forecast cache state:', forecastCache);
  const cacheEntry = forecastCache[city];
  if(cacheEntry) {
    if(cacheEntry.cacheTime < Date.now() - 5000) {
      delete locationCache[city];
      return null;
    }
    return cacheEntry.forecasts;
  }
  return null;
}

function setForecastsInCache(city, forecasts) {
  forecastCache[city] = {
    cacheTime: new Date(),
    forecasts
  };
  console.log('Updated forecast cache state:', forecastCache);
}

function weatherHandler(request, response) {
  const lat = parseFloat(request.query.latitude);
  const lon = parseFloat(request.query.longitude);
  const city = request.query.search_query;
  const forecastsFromCache = getForecastsFromCache(city);
  if(forecastsFromCache) {
    response.send(forecastsFromCache);
    return;
  }
  const url = 'https://api.weatherbit.io/v2.0/forecast/daily';
  superagent.get(url)
    .query({
      key: process.env.WEATHER_KEY,
      lat: lat,
      lon: lon,
    })
    .then(weatherBitResponse => {
      const arrayOfForecasts = weatherBitResponse.body.data;
      const forecastsResults = [];
      arrayOfForecasts.forEach(forecastObj => {
        forecastsResults.push(new Forecast(forecastObj));
      });
      setForecastsInCache(city, forecastsResults);
      response.send(forecastsResults);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

function notFoundHandler(request, response) {
  response.status(404).send('Not found');
}

function errorHandler(error, request, response, next) {
  response.status(500).json({ error: true, message: error.message });
}

// Constructors
function Location(city, location) {
  this.search_query = city;
  this.formatted_query = location.display_name;
  this.latitude = parseFloat(location.lat);
  this.longitude = parseFloat(location.lon);
}

function Restaurant(obj) {
  this.name = obj.name;
  this.url = obj.url;
  this.rating = obj.rating;
  this.price = obj.price;
  this.image_url = obj.image_url;
}

function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

// App listener
app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
