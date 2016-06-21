'use strict';

var arrivalsCtrl = require('../controllers/getArrivalsCtrl');
var departuresCtrl = require('../controllers/getDeparturesCtrl');

module.exports = function(router) {

  router.get('/arrivals', arrivalsCtrl);
  router.get('/departures', departuresCtrl);

};
