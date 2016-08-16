'use strict';

var pg = require('pg');
var db = require('../config.js').db; //TODO split this out server/client
var moment = require('moment');
module.exports = function(req, res) {

  var start = req.query.q;
  var days = req.query.d;
  var airport = req.query.a;

  var results = [];

  // Get a Postgres client from the connection pool
  pg.connect(db, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err});
    }

    var sql = {
      text: 'SELECT * FROM allflts2($1,$2,$3)',
      values: [start, days, airport]
    };

    var query = client.query(sql);

    // Stream results one row at a time
    query.on('row', function(row) {
      // row.isoDate = row.ddate+' '+row.dep; // ***moved to db (and corrected)***
      results.push(row);
    });

    // close connection and return results
    query.on('end', function() {
      done();

      //sort results on datetime  // ***moved to db***
      // results.sort(function(a,b) {
      //   var timea = (a.isoDate);
      //   var timeb = (b.isoDate);
      //   // console.log('a: '+timea + ' b: ' + timeb);

      //   if (timea > timeb) {
      //     return 1;
      //   } else if (timeb > timea) {
      //     return -1;
      //   } else {
      //     return 0;
      //   }

      // });
      return res.json(results);
    });
  });
};
