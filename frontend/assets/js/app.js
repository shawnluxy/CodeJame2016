var app = angular.module('myApp', ['ngRoute']);

app.controller('myCtrl', function($scope) {
    $scope.username = '';
    
    $scope.infoMessageHandler = function(){
        if($scope.username.toLowerCase() == 'principle' ){
            $scope.usernameinfo
            return 'Hi Principle!';
        }else if($scope.username.toLowerCase() == 'student'){
            return 'Hi Student!';
        }
        console.log($scope.username);
    }
    
});

