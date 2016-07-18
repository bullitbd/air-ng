'use strict';
/*jshint -W083 */

var Highcharts = require('highcharts');
var helpers = require('./services/helpers.js');
var config = require('./services/config.js');
var df = config.startForm;
var icao = require('./services/icao.js');
var dbdata = {};
var $inputs = $('#controls').find("[id]");
var moment = require('moment');
var period = config.chart.period;
var startDay = config.chart.startDay;
//require('highcharts/modules/exporting')(Highcharts);
//require('highcharts/themes/air.js')(Highcharts);



//console.log($inputs);

module.exports = {

  init: function() {

    Array.prototype.rotate = function(n) {
      return this.slice(n, this.length).concat(this.slice(0, n));
    };

    initForm(triggerChange);
    drawChart();

    //***********************************************************************

    function initForm(callback) {

      // load carrier control

      // carriers = carriers module
      $.each(icao.carriers, function(i, obj) {
        var name = obj.carrier + '   ' + obj.carriername;
        $('#carrier').append(new Option(name, obj.carrier, true, true));
      });

      // load airports select
      var airport = $('select[name=airport]');
      $.each(icao.airports, function(i, obj) {
        var name = obj.id + '   ' + obj.name;
        airport.append(new Option(name, obj.id));
      });
      airport.val(config.defAirport);

      // load delay select
      var delays = config.delays;
      var delay = $('select[name=delay]');
      $.each(delays, function(i, obj) {
        var period = (obj[0] > 0 && obj[0] < 1.5) ? ' hour' : ' hours';
        delay.append(new Option(obj[1] + period, obj[0]));
      });
      delay.val(config.delay);

      //initialize form controls:

      //setup datepicker
      var date_input = $('input[name="startDate"]');
      var today = new Date();
      var options = {
        setDate: today,
        format: 'yyyy-mm-dd',
        container: 'container',
        todayHighlight: true,
        autoclose: true,
      };
      date_input.datepicker(options).datepicker("update", today);

      //init other controls

      $('#numDays').val(df.numDays);
      $('#airport').val(df.airport);
      $('#arrivals').prop('checked', df.arrivals);
      $('#departures').prop('checked', df.departures);
      $('#international').prop('checked', df.international);
      $('#domestic').prop('checked', df.domestic);
      //$('#carrier').val set in load carriers control;
      $('#delay').val(df.delay);

      // inputs onChange handler

      var formChanged = function(e) {
        var formVals = getFormData($inputs);
        if (["startDate", "numDays", "airport"].indexOf(e.target.name) > -1) {
          getFlightData(formVals, updateDisplayData);
        } else {
          updateDisplayData(formVals);
        }
      };

      $inputs.on('change', formChanged);

      $('#carrier').selectpicker({
        selectedTextFormat: 'count > 1',
        header: 'close',
        liveSearch: true,
        noneSelectedText: 'none',
        actionsBox: true
      });

      //$('.carrier').selectpicker('refresh');


      //  $('select').selectr();
      callback(); // cb triggerChanged

    } // function initForm end;

    //***********************************************************************

    function triggerChange() { // setup initial state
      $('#numDays').triggerHandler('change'); // fire $inputs.on('change', formChanged);
    }

    //get form data and then GET flight data based on those choices;
    //called from / returned to $inputs.onChange handler;
    function getFormData(controls) {
      var key, val;
      var formVals = {};
      controls.each(function() {
        key = $(this).prop("id");
        val = ($(this).prop("type") == "checkbox") ? $(this).is(':checked') : $(this).val();
        formVals[key] = val;
      });
      return formVals;
    }

    //***********************************************************************

    // flight data ajax call to server api - uses server route to postgres function;
    function getFlightData(model, callback) { //called from init and $input.onChange

      var q = { // query string
        q: model.startDate,
        d: model.numDays,
        a: model.airport
      };
      var url = 'http://localhost:3000/flights/all';

      $.ajax({
        url: url,
        data: q,
        dataType: "json",

        success: function(result) {

          dbdata = result; // store result for continued use;
          callback(model); // cb updateDisplayData
        },

        error: function(request, status, error) {
          console.log('ERROR:', request.body, status, request.status, request.responseText);
        }
      });
    } // fn getFlightData

    //***********************************************************************

    // update Display called from $input.onChange and getFlightData as cb; provides filter with modelChange() for displayed data (calls exposeData);

    function updateDisplayData(form) {
      console.log('form from updateDisplayData: ', form);
      var currData = dbdata.filter(modelChanged(form));
      //console.log('filtered from updateDisplayData: ', currData);
      //callback(currData);
      exposeData(currData, form);
    }

    //***********************************************************************

    function modelChanged(form) { //filter fn for dbdata.filter
      console.log('form from modelChanged: ', form);
      var criteria;
      return function(obj) { // obj is 'each' of dbdata.filter
        //choose arrivals/departures/both
        if (form.departures) { // if departures checked
          if (form.arrivals) { // and arrivals checked
            criteria = true;
          } else {
            criteria = (obj.orig == form.airport);
          }
        } else if (form.arrivals) {
          criteria = (obj.dest == form.airport);
        }
        //return carrier in selected AND arrivals/departures
        return (form.carrier.indexOf(obj.car) > -1) && criteria; // filter for carrier
      };
    }

    //***********************************************************************

    function exposeData(data, form) {

      function panelInfo(data, format) { // info in panel header
        var counta = 0,
            countd = 0;
        $.each(data, function(i, obj) {
          if (obj.orig == form.airport) {
            countd += 1;
          } else if (obj.dest == form.airport) {
            counta += 1;
          }
        });
        var start = moment(form.startDate);
        var end = moment(start).add(form.numDays - 1, 'days');

        var arrdep = function(form) { // counts arrivals & departures separately
          if (form.arrivals) {
            if (form.departures) {
              return counta + ' Flights <span style="color:#008000"><em>Arriving at</em></span> & ' + countd + ' Flights <span style="color:#0000CD"><em>Departing from</em></span> ';
            } else {
              return counta + ' Flights <span style="color:#008000"><em>Arriving at</em></span> ';
            }
          } else if (form.departures) {
            return countd + ' Flights <span style="color:#0000CD"><em>Departing from</em><span> ';
          }
        };
        var daterange = (!end.isAfter(start)) ? start.format('LL') : start.format('LL') + ' to ' + end.format('LL');
        var str = (data.length > 0) ? '<strong>' + daterange + '</strong>' + ' &nbsp&nbsp&nbsp' + arrdep(form) + form.airport : '';

        $('#panelInfo span').html(str);

      } // fn panelInfo

      // ****************** CHART FUNCTIONS ***********************


      function makeSlots(data,controls,cb) { // important! these need to remain sorted! make 2 sets of slots for arrivals and departures populate
        // var period = config.period, moved to globals // minutes TODO add input control
        var intervals = controls.numDays   * 86400 / period / 60, //total # of slots
            slots = { arrSlots: [], depSlots: [] },
            start = moment(controls.startDate);
                            // console.log(intervals);
        for (var i = 0; i < intervals; i++) {
          var date = moment(start).add((i+1) * period, 'minutes').format('YYYY-MM-DD HH:mm:ss');
          for (var prop in slots) {
            slots[prop].push({date:date.split(' '), pax:0, flights:[]});
          }
        }
        console.log('slots array: ',slots);
        cb(data,slots,controls,drawChart); // cb = makeChartData
      } // fn makeSlots


      function makeChartData(data, slots, form, cb) { // cb = drawChart
        data.forEach(function(row) {
          var j = getSlot(row);
          // split into separate series
          if( row.dest == form.airport ) {
            slots.arrSlots[j].flights.push(row);
            slots.arrSlots[j].pax += row.seats;
          } else {
            slots.depSlots[j].flights.push(row);
            slots.depSlots[j].pax += row.seats;
          }

          function getSlot(obj) { // if obj date <= slot date return row push
            // console.log('getSlot obj? ',obj);
            for (var i = 0; i < slots.arrSlots.length; i++) {
              if (obj.isodate <= slots.arrSlots[i].date.join(' ')) {
                return i;
              }
            }
          }
        });
        cb(slots, form); // drawChart()
      } // fn makeChartData

      // capture slot period change:
      $('#slotTime').bind('keypress, change', function(e) {
        if (e.type === 'change' || e.keycode == 13) {
          period = $(this).val();
          $(this).blur();
          makeSlots(data, form, makeChartData);
        }
      // TODO set period cookie
      });

      $('#dayStart').bind('keypress, change', function(e) {
        if (e.type === 'change' || e.keycode == 13) {
          startDay = $(this).val();
          $(this).blur();
          makeSlots(data, form, makeChartData); //
        }
      // TODO set period cookie, combine functions;
      });

      //*********************************************************************

      makeSlots(data, form, makeChartData);
      makeTable(data, form);
      panelInfo(data, form);

    } // fn exposeData

    //***********************************************************************

    //create table using filtered data from updateDisplayData via exposeData

    function makeTable(celldata, formvals) {//build table to display charted records
      var tmap = config.tableMap;
      var content = '<tbody>';

      for (var i = 0; i < tmap.length; i++) { // get <th> rows
        var colhead = tmap.filter(function(obj) {
          return obj.pos == i;
        });

        content += '<th>' + colhead[0].title + '</th>';
      }
      $.each(celldata, function(index, val) {

        if (val.dest == formvals.airport) {
          content += '<tr style="color:#008000">';
        } else {
          content += '<tr style="color:#0000CD">';
        }

        for (var i = 0; i < tmap.length; i++) {
          var mapobj = tmap.filter(function(obj) {
            return obj.pos == i;
          });
          content += '<td>' + val[mapobj[0].data] + '</td>';
        }
        content += '</tr>';
      });

      content += '</tbody>';

      $('#flightTable').html(content);
    }

    function drawChart(slots, formvals) { // makeChartData cb
      var xvals = [],
          y0 = slots.arrSlots,
          y1 = slots.depSlots,
          s0 = [], // TODO check if empty array ok here...
          s1 = [];

          // TODO add drilldown to flight info;
          // TODO combine below into single function

      y0.forEach(function(obj) {
        s0.push([Date.parse(obj.date.join('T')),obj.pax]);
      });

      y1.forEach(function(obj) {
        s1.push([Date.parse(obj.date.join('T')),obj.pax]);
      });


      $('#main-chart').highcharts({
        chart: {
          type: 'areaspline',
          zoomType:'x'
        },
        title: {
          text: formvals.airport + ' Flight Arrivals and Departures'
        },

        legend: {
          enabled: false
          // layout: 'vertical',
          // align: 'left',
          // verticalAlign: 'top',
          // x: 150,
          // y: 100,
          // floating: true,
          // borderWidth: 1,
          // backgroundColor:
          // (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        xAxis: {
          title: '',
          type:'datetime'
          //dateTimeLabelFormats: {
                //day: '%e of %b'
            //}
        },
        yAxis: {
          title: {
            text: 'Passengers'
          },
          // labels: {
          //   formatter: function() {
          //       return Math.abs(this.value);
          //   }
          // }
        },
        tooltip: {
          shared: true,
          valueSuffix: ' passengers',
          crosshairs: {
            width: 2
          },
          positioner: function () {
                return { x: 80, y: 50 };
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
          data: s0,
          // [3, 4, 3, 5, 4, 10, 12, 1, 3, 4, 3, 3, 5, 4],
          fillColor:'rgba(0,128,0,0.3)',
          lineWidth:0


        }, {
          name: 'Departures',
          data: s1, // [1, 3, 4, 3, 3, 5, 4, 3, 4, 3, 5, 4, 10, 12],
          fillColor:'rgba(0,0,205,0.3',
          lineWidth:0
        }]
      },function() {
        $('#slotTime').val(period); // TODO make these persistent
        $('#dayStart').val(startDay);
      });
    }
  }
};
