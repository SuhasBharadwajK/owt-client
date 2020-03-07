var phonecatApp = angular.module('liveChatApp', []);

phonecatApp.controller('HomeController', function HomeController($scope) {
    var vm = this;
    vm.isChatWindowOpen = false;
    vm.messages = [];
    vm.isMicrophoneActive = true;
    vm.isCameraActive = true;

    vm.toggleChatWindow = function () {
        vm.isChatWindowOpen = !vm.isChatWindowOpen;
    };

    vm.sendMessage = function () {
        if (vm.messageText) {
            conference.send(vm.messageText).then(onMessageSent);
        }
    };

    vm.onMessageInputKeyUp = function(event) {
        if (event.key.toLowerCase() === 'enter' || event.which === 13) {
            if (vm.messageText) {
                vm.sendMessage();
            }
            else {
                vm.messageText = null;
            }
        }
    };

    vm.toggleMicrophone = function() {
        vm.isMicrophoneActive = !vm.isMicrophoneActive;
    };

    vm.toggleCamera = function() {
        vm.isCameraActive = !vm.isCameraActive;
    };

    vm.endCall = function() {
        conference.leave();
    };

    const init = function () {
        conference.addEventListener("messagereceived", onMessageReceived);
        vm.messageText = "";
    };


    const onMessageReceived = function (event) {
        vm.messages.push(new Message({messageText: event.message, from: event.origin, to: event.to, isMe: conference.info.self.id == event.origin }));
        $scope.$apply();
    };

    const onMessageSent = function() {
        $scope.$apply(function () {
            vm.messageText = null;
        });
    };

    init();
});

const Message = function (args) {
    this.messageText = args.messageText;
    this.from = args.from;
    this.to = args.to;
    this.isMe = args.isMe;
    this.timestamp = new Date();
}