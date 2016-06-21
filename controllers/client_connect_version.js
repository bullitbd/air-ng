'use strict';

var pg = require('pg');
var config = require('../../config');


// var client = new pg.Client(config.db);
// client.connect();

// module.exports = function(req, res) {

//     var sql = {
//       text: 'SELECT * FROM arrflts($1,$2)',
//       values: ['2016-06-05', 1]
//     };
//     var query = client.query(sql);

//     query.on('row', function(row, result) {
//         result.addRow(row);
//     });

//     query.on("end", function(result) {
//         res.send(result.rows, null, "\t");
//         //console.log(JSON.stringify(result.rows, null, "\t"));
//         client.end();
//     });
// };

module.exports = function(req, res) {

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
      text: 'SELECT * FROM arrflts($1,$2)',
      values: ['2016-06-05', 1]
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
