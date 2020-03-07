var phonecatApp = angular.module('liveChatApp', []);

phonecatApp.controller('HomeController', function HomeController($scope) {
    $scope.isChatWindowOpen = false;

    $scope.toggleChatWindow = function() {
        $scope.isChatWindowOpen = !$scope.isChatWindowOpen;
    }
});