'use strict';

var arrivalsCtrl = require('../controllers/getArrivalsCtrl');
var departuresCtrl = require('../controllers/getDeparturesCtrl');
var allCtrl = require('../controllers/getAllFltsCtrl');

module.exports = function(router) {

  router.get('/arrivals', arrivalsCtrl);
  router.get('/departures', departuresCtrl);
  router.get('/all', allCtrl);

};
