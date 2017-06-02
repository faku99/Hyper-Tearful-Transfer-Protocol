const port = 3000;

angular.module('app', [])

.controller('Ctrl', ['$http', '$scope', function($http, $scope) {

    $scope.result = 'Hyper Tearful Transfer Protocol';

    $scope.refresh = function() {
        $http.get('http://localhost:' + port + '/api/random').then(
            function(res) {
                $scope.result = res.data.join(' ');
            }
        );
    };

}]);
