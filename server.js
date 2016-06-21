'use strict';


var express = require('express');
var app = express();
var path = require('path');


var flightRoutes = express.Router();
require('./routes/flight_routes.js')(flightRoutes);

// app.get('/', function(req, res) {
//     res.sendFile(path.join(__dirname + '/build/index.html'));
// });
app.use('/flights', flightRoutes);
app.use('/', express.static(__dirname + '/build'));

app.all('*', function(req, res) {
  res.status(404).json({msg: 'page not found'});
});

app.listen(process.env.PORT || 3000, function() {
  console.log('server running on port ' + (process.env.PORT || 3000 ));
});



