var phonecatApp = angular.module('liveChatApp', []);

phonecatApp.controller('HomeController', function HomeController($scope) {
    var vm = this;
    vm.isChatWindowOpen = !false;
    vm.messages = [];


    vm.toggleChatWindow = function () {
        vm.isChatWindowOpen = !vm.isChatWindowOpen;
    };

    const init = function () {
        conference.addEventListener("messagereceived", onMessageReceived);
        vm.messageText = "";
    };


    const onMessageReceived = function (event) {
        vm.messages.push(new Message({messageText: event.message, from: event.origin, to: event.to, isMe: conference.info.self.id == event.origin }));
        $scope.$apply();
    };

    vm.sendMessage = function () {
        if (vm.messageText) {
            conference.send(vm.messageText).then(onMessageSent);
        }
    };

    const onMessageSent = function() {
        $scope.$apply(function () {
            vm.messageText = null;
        });
    }

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

    init();
});

const Message = function (args) {
    this.messageText = args.messageText;
    this.from = args.from;
    this.to = args.to;
    this.isMe = args.isMe;
    this.timestamp = new Date();
}