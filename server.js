'use strict';

// Application Dependencies
require('dotenv').config();
const express = require('express'); //

// Application Setup
const app = express(); //
const PORT = process.env.PORT || 3000; //

// Route Definitions
app.get('/', rootHandler);
app.get('/bad', (request, response) => { throw new Error('Sorry the the inconvenience.') });
app.use('*', notFoundHandler);
app.use(errorHandler);

// Route Handlers
function rootHandler(request, response) {
  response.status(200).send('City Explorer back-end');
}

function notFoundHandler(request, response) {
  response.status(404).send('404 - Not Found');
}

function errorHandler(error, request, response, next) {
  response.status(500).json({ error: true, message: error.message });
}

// App listener
app.listen(PORT,() => console.log(`Listening on port ${PORT}`)); //
