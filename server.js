'use strict';

// Application Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');


// Our Dependencies
const client = require('./modules/client');
const getLocationData = require('./modules/location');
const getRestaurantData = require('./modules/yelp');

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

function locationHandler(request, response) {
  const city = request.query.city.toLowerCase().trim();
  getLocationData(city)
    .then(locationData => {
      response.status(200).send(locationData);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

function restaurantHandler(request, response) {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const currentPage = request.query.page;
  getRestaurantData(lat, lon, currentPage)
    .then(restaurantData => {
      response.status(200).send(restaurantData);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

function weatherHandler(request, response) {
  const lat = parseFloat(request.query.latitude);
  const lon = parseFloat(request.query.longitude);
  const city = request.query.search_query;
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
function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

// App listener
client.connect()
  .then(() => {
    console.log('Postgres connected.');
    app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
  })
  .catch(err => {
    throw `Postgres error: ${err.message}`;
  });
