import { logoutUser } from '../../components/userCard/userCard.js'
import { World } from '../game/src/World.js';
import { displayEveryone } from './home.js'

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

    parseMessage: function(message) {
        const data = JSON.parse(message.data);
        if ( data.type == "Found Match" ) {
			World._instance.joinMatch( data.handle, data.paddle );
        } else if (type == "Refresh"){
            displayEveryone();
        } else {
            console.error("Weird data received from WS")
        }
    },

    sendMessageSocket: function(message) {
        if (this.interactive_socket) {
            this.interactive_socket.send(message);
        }
        else {
            console.error("CRITICAL ERROR SOCKET WAS NOT SETUP, you should never see this, if you do let me know. Dave");
        }
    },

    interactive_error_handler: function(message) {
        const error_type = message.error;
        if (error_type){
            console.log("AH");
            return;
        }
        console.log("Error", error_type);
    },

    closeSocket: function() {
        if (this.interactive_socket) {
            this.interactive_socket.close();
            this.interactive_socket = null;
        }
    }
};

export default interactiveSocket;
