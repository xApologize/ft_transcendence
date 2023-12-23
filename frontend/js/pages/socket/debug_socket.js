import { loadHTMLPage } from '../../api/fetchData.js';
import interactiveSocket from '../home/socket.js'

export async function showSocket() {
  try {
    await loadHTMLPage('./js/pages/socket/socket.html');

    document.getElementById('SendMessageInteractive').addEventListener('click', async () => {
      interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Refresh", "user": "demo-user2"}));
    });

    document.getElementById('JoinMatch').addEventListener('click', async () => {
      interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Find Match"}));
    });

  } catch (error) {
    console.error('Error fetching game.html:', error);
  }
}
