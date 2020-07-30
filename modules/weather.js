'use strict';

const superagent = require('superagent');

function getWeatherData(latitude, longitude) {
  const url = 'https://api.weatherbit.io/v2.0/forecast/daily';
  return superagent.get(url)
    .query({
      key: process.env.WEATHER_KEY,
      lat: latitude,
      lon: longitude,
      days: 5
    })
    .then(weatherBitResponse => {
      const arrayOfForecasts = weatherBitResponse.body.data;
      const forecastsResults = arrayOfForecasts.map(forecastObj => new Forecast(forecastObj));
      return Promise.resolve(forecastsResults);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

module.exports = getWeatherData;
