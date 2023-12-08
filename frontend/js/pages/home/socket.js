let interactive_socket;

export function initSocket() {
    interactive_socket = new WebSocket('wss://' + window.location.host + '/ws/pong/interactive' + "?" + sessionStorage.getItem('jwt'));
    interactive_socket.addEventListener("close", (event) => {
        console.log("The exit code for the socket:", event.code)
    })
    interactive_socket.addEventListener("open", (event) => {
        console.log("Socket opened", event)
        interactive_socket.send("TEST")
    })
    interactive_socket.addEventListener("close", (event) => {
        console.log("The exit code for the socket:", event.code)
    })
    interactive_socket.addEventListener("message", (event) => {
        console.log("Message", event)
    })
}

export function sendMessageSocket(message) {
    interactive_socket(message)
}