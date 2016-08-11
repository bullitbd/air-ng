'use strict';
/*jshint -W083 */
module.exports = function(slots, formvals, period, startDay) {
  console.log('chart: ', slots, formvals, period, startDay);

  // TODO add drilldown to flight info;
  // build chart data series:
  var s = {};
  for(var i = 0, keys = Object.keys(slots); i < keys.length; i++) {
    s[keys[i] + 'Data'] = slots[keys[i]].map(function(obj) {
      return [Date.parse(obj.date.join('T')), obj.pax];
    });
  }

    var options = {
    chart: {
      type: 'areaspline',
      zoomType: 'x'
    },
    title: {
      text: formvals.airport + ' Flight Arrivals and Departures'
    },

    legend: {
      enabled: false
    },

    xAxis: {
      title: '',
      minRange: 60000,
      startOnTick: false,
      endOnTick: false,
      type: 'datetime',
      dateTimeLabelFormats: {
        //day: '%e of %b'
      },
      events: {

        afterSetExtremes: function() {

          var series = this.series[1],
              points = series.points,
              selected = [];
          for (var i = 0; i < points.length; i++) {
            if (points[i].isInside) {
              selected.push(points[i].index);
            }
          }
          console.log(selected);
        }
      }

    },
    yAxis: {
      title: {
        text: 'Passengers'
      },


    },
    tooltip: {
      shared: true,
      valueSuffix: ' passengers',
      crosshairs: {
        width: 2
      },
      positioner: function() {
        return { x: 60, y: 30 };
      },
      // formatter: function() {
      //   return this.x + '<br/>' + this.series.name + ': ' + Math.abs(this.y);
      // }

    },
    credits: {
      enabled: false
    },
    plotOptions: {
      areaspline: {
        //fillOpacity: 0.2
      },
      series: {
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: false
            }
          }
        },
        states: {
          hover: {
            lineWidthPlus: 0
          }
        }
      },
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: [{
      name: 'Arrivals',
      data: s.arrSlotsData,
      fillColor: 'rgba(0,128,0,0.3)',
      lineWidth: 0


    }, {
      name: 'Departures',
      data: s.depSlotsData,
      fillColor: 'rgba(0,0,205,0.3)',
      lineWidth: 0
    }]
  };

  $('#main-chart').highcharts(options, function() {
    $('#slotTime').val(period); // TODO make these persistent
    $('#dayStart').val(startDay);
  });

}; // exports
