var app = angular.module('liveChatApp', []);

app.controller('HomeController', function HomeController($scope, $http) {
    var vm = this;
    vm.isChatWindowOpen = false;
    vm.messages = [];
    vm.participants = [];
    vm.isMicrophoneActive = true;
    vm.isCameraActive = true;
    vm.me = null;
    vm.areUnreadMessagesPresent = false;

    const roomId = "5e639fc41a59767544ecd940";

    vm.toggleChatWindow = function () {
        if (!vm.isChatWindowOpen) {
            vm.areUnreadMessagesPresent = false;
        }

        vm.isChatWindowOpen = !vm.isChatWindowOpen;
    };

    vm.sendMessage = function () {
        if (vm.messageText) {
            conference.send(vm.messageText).then(onMessageSent);
        }
    };

    vm.onMessageInputKeyUp = function (event) {
        if (event.key.toLowerCase() === 'enter' || event.which === 13) {
            if (vm.messageText) {
                vm.sendMessage();
            }
            else {
                vm.messageText = null;
            }
        }
    };

    vm.toggleMicrophone = function () {
        vm.isMicrophoneActive = !vm.isMicrophoneActive;
    };

    vm.toggleCamera = function () {
        vm.isCameraActive = !vm.isCameraActive;
    };

    vm.endCall = function () {
        conference.leave();
    };

    const init = function () {
        conference.addEventListener("messagereceived", onMessageReceived);
        conference.addEventListener("participantjoined", onParticipantJoined);
        conference.addEventListener("streamadded", onStreamAdded);
        vm.messageText = "";
    };


    const onMessageReceived = function (event) {
        vm.areUnreadMessagesPresent = !vm.isChatWindowOpen;
        var participant = getParticipant(event.origin);
        vm.messages.push(new Message({ messageText: event.message, from: event.origin, to: event.to, isMe: conference.info.self.id == event.origin }, participant));
        $scope.$apply();
    };

    const onParticipantJoined = function (event) {
        // TODO: This will add a duplicate participant even though the participant previously left and rejoined the stream.
        getParticipant(event.participant.id);
    };

    const onStreamAdded = function (event) {
        getCurrentParticipants();
    };

    const onMessageSent = function () {
        $scope.$apply(function () {
            vm.messageText = null;
        });
    };

    const getCurrentParticipants = function () {
        $http({
            method: 'GET',
            url: `/rooms/${roomId}/participants`
        }).then(function (response) {
            for (const p of response.data) {
                vm.participants.push(new Participant(p, getParticipantAvatarName()));
            }

            vm.me = new Participant(vm.participants.find(function (p) { return p.id == conference.info.self.id }));

        }, function (error) {
            console.log("An error occurred while trying to fetch participants.")
        });
    };

    const getParticipant = function (participantId) {
        var existingParticipant = vm.participants.find(function (p) { return p.id == participantId });
        if (existingParticipant) {
            return existingParticipant;
        }

        $http({
            method: 'GET',
            url: `/rooms/${roomId}/participants/${participantId}`
        }).then(function (response) {
            vm.participants.push(new Participant(response.data, getParticipantAvatarName()));
        }, function (error) {
            console.log("An error occurred while trying to fetch the participant.")
        });
    };

    const getParticipantAvatarName = function () {
        const prefix = "avatar";
        const genders = ["male", "female"];
        for (const gender of genders) {
            for (let index = 1; index <= 6; index++) {
                var fileName = `${prefix}-${gender}-${index}.jpg`;
                if (!vm.participants.some(function (p) { return p.avatarFileName === fileName; })) {
                    return fileName;
                }
            }
        }
    };

    init();
});

const Message = function (args, fromParticipant) {
    this.messageText = args.messageText;
    this.from = args.from;
    this.to = args.to;
    this.isMe = args.isMe;
    this.timestamp = new Date();
    this.fromParticipant = new Participant(fromParticipant);
}

const Participant = function (args, avatarFileName) {
    this.id = args.id;
    this.role = args.role;
    this.user = args.user;
    this.userId = args.userId;
    this.permissions = new ParticipantPermissions(args.permission || {});
    this.avatarFileName = avatarFileName || args.avatarFileName;
};

const ParticipantPermissions = function (args) {
    this.publish = new StreamPermission(args.publish || {});
    this.subscribe = new StreamPermission(args.subscribe || {});
};

const StreamPermission = function (args) {
    this.video = !!args.video;
    this.audio = !!args.audio;
};