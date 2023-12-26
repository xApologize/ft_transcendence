import { logoutUser } from '../../components/userCard/userCard.js'
import { World } from '../game/src/World.js';
import { displayEveryone } from './home.js'
import { updateSocial } from './social.js'
import { newUser, removeUser, updateSpecificUser } from './utils.js'

const interactiveSocket = {
    interactive_socket: null,

    initSocket: function() {
        const self = this;
        if (this.interactive_socket === null){
            this.interactive_socket = new WebSocket('wss://' + window.location.host + '/ws/pong/interactive' + "?" + sessionStorage.getItem('jwt'));
            self.interactive_socket.onerror = function(event) {
                console.error("WebSocket error:", event);
                logoutUser();
            };
            this.interactive_socket.onopen = async function(event) {
                console.log("𝕴𝖓𝖙𝖊𝖗𝖆𝖈𝖙𝖎𝖛𝖊 𝖘𝖔𝖈𝖐𝖊𝖙 𝖎𝖘 𝖓𝖔𝖜 𝖔𝖕𝖊𝖓");
            }
            this.interactive_socket.onclose = async function(event) {
                console.log("𝕴𝖓𝖙𝖊𝖗𝖆𝖈𝖙𝖎𝖛𝖊 𝖘𝖔𝖈𝖐𝖊𝖙 𝖍𝖆𝖘 𝖇𝖊𝖊𝖓 𝖈𝖑𝖔𝖘𝖊𝖉");
            };
            this.interactive_socket.onmessage = function(event) {
                self.parseMessage(event);
            };
        } else {
            console.error("Interactive socket already exist");
        }
    },

    closeSocket: function() {
        if (this.interactive_socket) {
            this.interactive_socket.close();
            this.interactive_socket = null;
        }
    },

    sendMessageSocket: function(message) {
        if (this.interactive_socket) {
            this.interactive_socket.send(message);
        } else {
            console.error("CRITICAL ERROR SOCKET WAS NOT SETUP, you should never see this, if you do let me know. Dave");
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
                World._instance.joinMatch( data.handle, data.paddle, data.me, data.opponent );
                break;
            case "Refresh":
                this.refresh_handler(data);
                break;
            case "Init":
                displayEveryone();
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
            case "Social":
                updateSocial();
                break;
            default:
                console.error("Rtype error");
        }
    },

    interactive_error_handler: function(message) {
        const error_type = message.error;
        if (!error_type){
            console.error("No error message provided");
            return;
        }
        console.error("Error", error_type);
    }
};

export default interactiveSocket;
