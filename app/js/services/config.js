'use strict';

module.exports = {

    //server: 'http://52.41.213.81:3000',

    form: {
      airport: 'LAX'
    },

    delays: [
      [0, "0"],
      [0.5, "1/2"],
      [1, "1"],
      [1.5, "1-1/2"],
      [2, "2"],
      [2.5, "2-1/2"],
      [3, "3"]
    ],

    table: {
      init: {
        rows: 30
      },

      map: [ //needed because for-in doesn't guarantee property order
        {title: "air", data: "car", pos: 0},
        {title: "flight", data: "flt", pos: 1},
        {title: "from", data: "orig", pos: 2},
        {title: " ", data: "dcity", pos:3},

        {title: "date", data: "ddate", pos: 4},
        {title: "departs", data: "dep", pos: 5},
        {title: "to", data: "dest", pos: 6},
        {title: " ", data: "acity", pos: 7},
        {title: "arrives", data: "arr", pos: 8},
        {title: "seats", data: "seats", pos: 9},
        {title: "a/c", data: "plane", pos: 10},
        //{title: "dow", data: "daynum", pos: 11}
        {title: "+/-", data: "next", pos: 11},
        {title: "ts", data: "ts", pos: 12}


      ]
    },

    startForm: {
      numDays: 1,
      arrivals: true,
      departures: true,
      airport: "LAX",
      domestic: true,
      international: true,
      carrier: "",
      delay: 2
    },

    chart: {
      period: 15,
      startDay: '00:00'
    }

};
