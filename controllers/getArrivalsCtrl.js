'use strict';

var pg = require('pg');
var db = require('../config').db;

module.exports = function(req, res) {

    var start = req.query.q;
    var days = req.query.d;

    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(db, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        //
        var sql = {
      text: 'SELECT * FROM depflts($1,$2)',
      values: [start, days]
    };

        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

};
