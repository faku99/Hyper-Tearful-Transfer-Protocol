angular.module('http', ['angularMoment'])

.controller('controller', ['$http', '$scope', '$timeout', 'moment', function($http, $scope, $timeout, moment) {

    $scope.containersList = [];
    $scope.imagesList = [];

    $scope.createContainer = function(i) {
        $http.post('/api/containers/create', {
            Image: $scope.imagesList[i].RepoTags[0]
        });
    };

    $scope.killAllContainers = function() {
        $http.post('/api/containers/killall');
    };

    $scope.killContainer = function(i) {
        $http.post('/api/containers/' + $scope.containersList[i].Id + '/kill');
    };

    $scope.removeAllContainers = function() {
        $http.delete('/api/containers');
    };

    $scope.removeContainer = function(i) {
        $http.delete('/api/containers/' + $scope.containersList[i].Id);
    };

    $scope.startContainer = function(i) {
        $http.post('/api/containers/' + $scope.containersList[i].Id + '/start');
    };

    function beautify(item) {
        item.Created = moment.unix(item.Created).fromNow();
        item.Id = item.Id.substring(0, 12);
        item.Size = bytesToSize(item.Size);
    }

    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    function getContainersList() {
        $http.get('/api/containers/list').then(
            function(response) {
                for (var i in response.data) {
                    beautify(response.data[i]);
                }

                $scope.containersList = response.data;
            }
        );
    }

    function getImagesList() {
        $http.get('/api/images/list').then(
            function(response) {
                for (var i in response.data) {
                    beautify(response.data[i]);
                }

                $scope.imagesList = response.data;
            }
        );
    }

    function refreshData() {
        getContainersList();
        getImagesList();

        $timeout(function() {
            refreshData();
        }, 1000);
    }

    refreshData();

}]);
