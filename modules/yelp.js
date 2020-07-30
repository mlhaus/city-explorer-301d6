'use strict';

const superagent = require('superagent');

function getRestaurantData(lat, lon, currentPage) {
  const numPerPage = 4;
  const start = ((currentPage - 1) * numPerPage + 1);
  const url = 'https://api.yelp.com/v3/businesses/search';
  return superagent.get(url)
    .query({
      latitude: lat,
      longitude: lon,
      limit: numPerPage,
      offset: start
    })
    .set('Authorization', `Bearer ${process.env.YELP_KEY}`)
    .then(yelpResponse => {
      const arrayOfRestaurants = yelpResponse.body.businesses;
      const restaurantsResults = arrayOfRestaurants.map(restaurantObj => new Restaurant(restaurantObj));
      return Promise.resolve(restaurantsResults);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

function Restaurant(obj) {
  this.name = obj.name;
  this.url = obj.url;
  this.rating = obj.rating;
  this.price = obj.price;
  this.image_url = obj.image_url;
}

module.exports = getRestaurantData;
