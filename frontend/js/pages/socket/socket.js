import { loadHTMLPage } from '../../api/fetchData.js';

export async function showSocket() {
  try {
    await loadHTMLPage('./js/pages/socket/socket.html');
    let chatSocketA, chatSocketB;

    document.getElementById('CreateSocketA').addEventListener('click', () => {
      chatSocketA = new WebSocket('wss://' + window.location.host + '/ws/pong/UserA');
      console.log("SocketA= ", chatSocketA);
    });

    document.getElementById('CreateSocketB').addEventListener('click', () => {
      chatSocketB = new WebSocket('wss://' + window.location.host + '/ws/pong/UserB');
      console.log("SocketB= ", chatSocketB);
    });

    function asyncPrompt(message) {
      return new Promise((resolve) => {
        const userInput = prompt(message);
        resolve(userInput);
      });
    }

    document.getElementById('SendA').addEventListener('click', async () => {
      if (chatSocketA.readyState === WebSocket.OPEN) {
        const message = await asyncPrompt("Enter the message you want to send to user A");
        chatSocketA.send(message);
      } else {
        console.error("SocketA is not open!");
      }
    });

    document.getElementById('SendB').addEventListener('click', async () => {
      if (chatSocketB.readyState === WebSocket.OPEN) {
        const message = await asyncPrompt("Enter the message you want to send to user A");
        chatSocketB.send(message);
      } else {
        console.error("SocketB is not open!");
      }
    });

  } catch (error) {
    console.error('Error fetching game.html:', error);
  }
}
