'use strict';

// Application Dependencies
require('dotenv').config();
const express = require('express'); //

// Application Setup 
const app = express(); //
const PORT = process.env.PORT || 3000; //

// Route Definitions
app.use(express.static('./public'));
app.get('/greet', greetHandler);
app.get('/data', dataHandler);
app.use('*', notFoundHandler);

// Route Handlers
function greetHandler(request, response) {
  response.status(200).send('Hello World!');
}

function dataHandler(request, response) {
  const airplanes = [
    {
      departure: new Date(2020, 7, 24),
      canFly: true,
      pilot: 'Well Trained'
    },
    {
      departure: new Date(2020, 7, 25),
      canFly: false,
      pilot: 'NA'
    }
  ];
  response.status(200).json(airplanes);
}

function notFoundHandler(request, response) {
  response.status(404).send('404 - Not Found');
}

// App listener
app.listen(PORT,() => console.log(`Listening on port ${PORT}`)); //
