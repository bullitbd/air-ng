'use strict';

app.factory('dataService', ['$http', function ($http) {
  var request = $http({
    method: "get",
    url: './config.server' || 'http://localhost:3000',
    params: {
        action: "get"
    }
  });

  function getData() {
    return request.then(function success(response) {
      return response;
    }, function error(response) {
      alert(response);
    });
  };

  return {
    getData: getData
  };
});
