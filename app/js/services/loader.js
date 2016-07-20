'use strict';

(function() {

    var i = 0;
    setInterval(function() {
      i = ++i % 4;
      $('#fetching').html('fetching data ' + Array(i + 1).join('. '));
    }, 600);

    setTimeout(function() {
      $('.loader').hide();
    }, 5000);

})();
