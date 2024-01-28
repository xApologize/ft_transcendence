import { World } from '../game/src/World.js';
import { displayEveryone } from './home.js'
import { handleInviteInteraction } from './inviteGame.js';
import { newUser, removeUser, updateSpecificUser, handleSocialUpdate } from './socketUpdate.js'
import { socketTournamentUser } from './tournament.js'
import { navigateTo } from '../../router.js';
import { updateSpecificUserStatus } from './socketUpdate.js';
import { fetchAuth } from '../../api/fetchData.js';
import { hideAllUI, hideElementById } from './utils.js';
import { logoutUser } from '../../components/userCard/userCard.js';

const interactiveSocket = {
    interactive_socket: null,

    initSocket: function() {
        const self = this;
        if (this.interactive_socket === null){
            this.interactive_socket = new WebSocket('wss://' + window.location.host + '/wss/pong/interactive' + "?" + sessionStorage.getItem('jwt'));
            self.interactive_socket.onerror = function(event) {
                console.error("WebSocket error:", event);
                interactiveSocket.closeSocket();
                logoutUser();
            };
            this.interactive_socket.onopen = async function(event) {
                console.log("𝕴𝖓𝖙𝖊𝖗𝖆𝖈𝖙𝖎𝖛𝖊 𝖘𝖔𝖈𝖐𝖊𝖙 𝖎𝖘 𝖓𝖔𝖜 𝖔𝖕𝖊𝖓");
            }
            this.interactive_socket.onclose = async function(event) {
                this.interactive_socket = null
                console.log("𝕴𝖓𝖙𝖊𝖗𝖆𝖈𝖙𝖎𝖛𝖊 𝖘𝖔𝖈𝖐𝖊𝖙 𝖍𝖆𝖘 𝖇𝖊𝖊𝖓 𝖈𝖑𝖔𝖘𝖊𝖉");
            };
            this.interactive_socket.onmessage = function(event) {
                self.parseMessage(event);
            };
        } else {
            console.error("Failsafe activated, closing already existing socket?");
            this.interactive_socket.close();
            this.interactive_socket = null
            logoutUser();
        }
    },

    closeSocket: function() {
        if (this.interactive_socket) {
            this.interactive_socket.close();
            this.interactive_socket = null
        }
    },

    sendMessageSocket: function(message) {
        if (this.interactive_socket) {
            this.interactive_socket.send(message);
        } else {
            console.error("CRITICAL ERROR SOCKET WAS NOT SETUP, you should never see this, call 911 NOW, if you do let me know. Dave");
        }
    },

    parseMessage: function(message) {
        let data;
        try{
            data = JSON.parse(message.data);
        } catch (error) {
            console.error(error);
            return;
        }
        switch (data.type) {
            case "Found Match":
                hideAllUI(true);
                World._instance.joinMatch( data.handle, data.paddle, data.me, data.opponent, "Upgraded" );
                break;
            case "Refresh":
                this.refresh_handler(data);
                break;
            case "Match Invite":
                this.match_invite_handler(data);
                break;
            case "Tournament":
                this.tournament_handler(data);
                break;
            case "Tournament Match":
                setTimeout(() => {
                    hideElementById('bracket')
                    hideElementById('result')
					document.getElementById('timer').innerHTML = "Waiting..."
                    World._instance.joinMatch( data.handle, data.paddle, data.me, data.opponent, "Upgraded", 2 );
                }, 5000);
				document.getElementById('timer').innerHTML = "Match starting soon"
				break;
            case "Tournament Final":
				setTimeout(() => {
                    hideElementById('bracket')
                    hideElementById('result')
					document.getElementById('timer').innerHTML = "Waiting..."
					World._instance.joinMatch( data.handle, data.paddle, data.me, data.opponent, "Upgraded", 1 );
				}, 5000);
				document.getElementById('timer').innerHTML = "Match starting soon"
                break;
            case "Found Match Classic":
                hideAllUI(true);
                World._instance.joinMatch( data.handle, data.paddle, data.me, data.opponent, "Classic" );
                break;
            case "Init":
                displayEveryone();
                break;
            case "Logout":
                interactiveSocket.closeSocket();
                logoutUser();
                break;
            case "Invalid":
                this.interactive_error_handler(data);
                break;
            default:
                console.error("Invalid type sent to interactive socket");
        }
    },

    refresh_handler: function(data) {
        const id = data.id;
        const refresh_type = data.rType;
        const other_user_id = data.other_user_id;
        if (!id || !refresh_type){
            console.error("Refresh Handler error");
            return;
        }
        switch (data.rType) {
            case "Login":
                newUser(id);
                break;
            case "Logout":
                removeUser(id);
                break;
            case "User":
                updateSpecificUser(id);
                break;
            case "ONL":
            case "ING":
                updateSpecificUserStatus(id, data.rType);
                break;
            case "add":
            case "cancel":
            case "accept":
            case "refuse":
            case "unfriend":
                handleSocialUpdate(refresh_type, id, other_user_id);
                break;
            case "sendGameInvite":
            case "cancelGameInvite":
            case "acceptGameInvite":
            case "refuseGameInvite":
            case "refreshGameInvite":
                handleInviteInteraction(refresh_type, id, other_user_id)
                break;
            default:
                console.error("Rtype error: ", data.rType);
        }
    },

    tournament_handler: function(data) {
        const id = data.id;
        const refresh_type = data.rType;
        if (!id || !refresh_type){
            console.error("Refresh Handler error");
            return;
        }
        socketTournamentUser(refresh_type, id)
    },

    match_invite_handler: function(data) {
        console.log("Heyyy macarena", data);
    },

    interactive_error_handler: function(message) {
        const error_type = message.error;
        if (!error_type){
            console.error("No error message provided");
            return;
        }
        console.error("Error", error_type);
    },

    isSocketClosed: function() {
        if (this.interactive_socket === null || this.interactive_socket.readyState === WebSocket.CLOSED) {
            if (this.interactive_socket) {
                this.interactive_socket = null;
            }
            return true;
        }
        return false
    },
};

export default interactiveSocket;

async function forceLogout() {
    const logoutResponse = await fetchAuth('POST', 'logoutsocket/')
    if (!logoutResponse) { return }
    if (logoutResponse.status == 200) {
        navigateTo('/')
    }
}
