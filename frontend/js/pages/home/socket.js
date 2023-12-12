import { fetchToken } from '../../api/fetchData.js';
import { logoutUser } from '../../components/userCard/userCard.js'
import { World } from '../game/src/World.js';

const interactiveSocket = {
    interactive_socket: null,
    connexion_attempt: 0,

    initSocket: function() {
        // TODO add double socket try incase of failure?
        const self = this;
        if (this.interactive_socket === null){
            if (this.connexion_attempt === 2){
                logoutUser();
            }
            this.interactive_socket = new WebSocket('wss://' + window.location.host + '/ws/pong/interactive' + "?" + sessionStorage.getItem('jwt'));
            this.connexion_attempt++
            // console.log("Attempt counter:", this.connexion_attempt)
            self.interactive_socket.onerror = function(event) {
                console.error("WebSocket error:", event);
                logoutUser();
            };
            this.interactive_socket.onopen = async function(event) {
                console.log("𝕴𝖓𝖙𝖊𝖗𝖆𝖈𝖙𝖎𝖛𝖊 𝖘𝖔𝖈𝖐𝖊𝖙 𝖎𝖘 𝖓𝖔𝖜 𝖔𝖕𝖊𝖓")
            }
            this.interactive_socket.onclose = async function(event) {
                console.log("𝕴𝖓𝖙𝖊𝖗𝖆𝖈𝖙𝖎𝖛𝖊 𝖘𝖔𝖈𝖐𝖊𝖙 𝖍𝖆𝖘 𝖇𝖊𝖊𝖓 𝖈𝖑𝖔𝖘𝖊𝖉")
            };
            this.interactive_socket.onmessage = function(event) {
                self.parseMessage(event);
            };
        } else {
            // Should never see this in the future
            console.error("Interactive socket already exist")
        }
    },

    parseMessage: function(message) {
        const type = JSON.parse(message.data).type;
        console.log("IM StuPID:", message)
        if (type == "Found Match"){
			World._instance.wsPath = JSON.parse(message.data).handle;
			World._instance.side = JSON.parse(message.data).paddle;
            console.log("ADD FIND MATCH LOGIC HERE")
        } else {
            console.error("What are you doing?")
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

    closeSocket: function() {
        if (this.interactive_socket) {
            this.interactive_socket.close();
            this.interactive_socket = null;
        }
    }
};

export default interactiveSocket;
