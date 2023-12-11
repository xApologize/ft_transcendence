import { fetchToken } from '../../api/fetchData.js';

const interactiveSocket = {
    interactive_socket: null,
    
    initSocket: function() {
        if (this.interactive_socket === null){
            this.interactive_socket = new WebSocket('wss://' + window.location.host + '/ws/pong/interactive' + "?" + sessionStorage.getItem('jwt'));
            this.interactive_socket.onclose = async function(event) {
                const result = await fetchToken('GET', { status: ['ONL', 'ING'] });
                console.log(result)
            };
            this.interactive_socket.onmessage = function(event) {
                console.log("Received message:", event.data);
            };
        } else {
            console.log("Token already existed")
        }
    },
    
    sendMessageSocket: function(message) {
        if (this.interactive_socket) {
            this.interactive_socket.send(message);
        }
        else {
            console.error("CRITICAL ERROR SOCKET WAS NOT SETUP, you should never see this, if you do let me know");
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
