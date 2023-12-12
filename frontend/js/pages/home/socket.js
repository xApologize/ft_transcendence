import { fetchToken } from '../../api/fetchData.js';

const interactiveSocket = {
    interactive_socket: null,
    connexion_attempt: 0,
    
    initSocket: function() {
        if (this.interactive_socket === null){
            this.interactive_socket = new WebSocket('wss://' + window.location.host + '/ws/pong/interactive' + "?" + sessionStorage.getItem('jwt'));
            this.connexion_attempt++
            this.interactive_socket.onerror = function(event) {
                console.error("WebSocket error:", event);
                return
              };
            this.interactive_socket.onclose = async function(event) {
                failure_counter++
                if (this.failure_counter === 2) {
                    // Make user logout TODO
                    return
                } else {
                    await fetchToken('GET', { status: ['ONL', 'ING'] });
                    initSocket()
                }
            };
            this.interactive_socket.onmessage = function(event) {
                console.log("Received message:", event.data);
            };
        } else {
            // Should never see this in the future
            console.log("Interactive socket already exist")
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
            console.log("The interactive socket has been closed")
        }
    }
};

export default interactiveSocket;
