import { loadHTMLPage } from '../../api/fetchData.js';

export async function showSocket() {
	try {
	  await loadHTMLPage('./js/pages/socket/socket.html');
      document.getElementById('CreateSocketA').addEventListener('click', async () => {
        const chatSocket = new WebSocket(
          'wss://'
          + 'localhost:8000'
          + '/ws/chat/'
      );
      console.log("Socket= ", chatSocket)
      })
      document.getElementById('CreateSocketB').addEventListener('click', async () => {
        console.log("TESTa")
      })
      function asyncPrompt(message) {
        return new Promise((resolve) => {
          const userInput = prompt(message);
          resolve(userInput);
        });
      }
      document.getElementById('SendA').addEventListener('click', async () => {
        const message = await asyncPrompt("Enter the message you want to send to user B");
        console.log(message);
      });
      
      document.getElementById('SendB').addEventListener('click', async () => {
        const message = await asyncPrompt("Enter the message you want to send to user A");
        console.log(message);
      });
      
  } catch (error) {
	  console.error('Error fetching game.html:', error);
  }
}
