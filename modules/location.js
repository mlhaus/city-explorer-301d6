'use strict';

const superagent = require('superagent');
const client = require('./client');

function getLocationData(city) {
  const SQL = 'SELECT * FROM locations WHERE search_query = $1';
  const values = [city];
  return client.query(SQL, values)
    .then((results) => {
      if(results.rowCount) {
        return results.rows[0];
      } else {
        const url = 'https://us1.locationiq.com/v1/search.php';
        superagent.get(url)
          .query({
            key: process.env.LOCATION_KEY,
            q: city,
            format: 'json'
          })
          .then((data) => {
            setLocationData(city, data.body[0]);
          });
      }
    });
}

function setLocationData(city, locationData) {
  const location = new Location(city, locationData);
  const SQL = `
    INSERT INTO locations (search_query, formatted_query, latitude, longitude)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
`;
  const values = [city, location.formatted_query, location.latitude, location.longitude];
  return client.query(SQL, values)
    .then(results => {
      results.rows[0];
    });
}

function Location(city, location) {
  this.search_query = city;
  this.formatted_query = location.display_name;
  this.latitude = parseFloat(location.lat);
  this.longitude = parseFloat(location.lon);
}

module.exports = getLocationData;
