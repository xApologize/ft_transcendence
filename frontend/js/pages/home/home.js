import { fetchUser } from '../../api/fetchData.js';
import { loadHTMLContent } from '../../api/fetchData.js';

export async function showHome() {
  try {
    await loadHTMLContent('./js/pages/home/home.html')

    document.getElementById('createUser').addEventListener('click', () => {
      createUser();
    });

    document.getElementById('getUser').addEventListener('click', async () => {
      const nicknameInput = document.getElementById('nicknameInput').value;
      if (!nicknameInput) {
        alert("Fill in the nickname");
        return;
      }
      let user = await fetchUser('GET', nicknameInput)
      if (typeof user === 'string') {
          displayErrorMessage(user);
        } else {
          displayUsers(user); // Use displayUser for a single user
        }
    });

    document.getElementById('getUsers').addEventListener('click', async () => {
      const users = await fetchUser('GET');
      displayUsers(users);
    });
  
    document.getElementById('reset').addEventListener('click', () => {
      resetPage();
    });
  } catch (error) {
    console.error('Error fetching home.html:', error);
  }
}


function displayErrorMessage(errorMessage) {
  const error = document.getElementById('errorMessage');
  error.classList.remove('d-none');

  error.innerHTML = '';

  const errorElement = document.createElement('p');
  errorElement.textContent = errorMessage;

  error.appendChild(errorElement);
}

function resetPage() {
  const usersContainer = document.getElementById('userData');
  const error = document.getElementById('errorMessage');
  error.classList.add('d-none')

  const userNodes = usersContainer.querySelectorAll('.user-list > .user-template');
  userNodes.forEach(node => node.remove());

  error.innerHTML = '';
}

function displayUsers(users) {
  const usersContainer = document.getElementById('userData');
  const userTemplate = document.querySelector('.user-template');

  usersContainer.innerHTML = '';

  users.forEach(user => {
    const newUser = userTemplate.cloneNode(true);
    newUser.classList.remove('d-none');

    // Fill in the user data
    newUser.querySelector('.user-avatar').src = user.avatar;
    newUser.querySelector('.user-nickname').textContent = `Nickname: ${user.nickname}`;
    newUser.querySelector('.user-email').textContent = `Email: ${user.email}`;
    newUser.querySelector('.user-status').textContent = `Status: ${user.status}`;
    newUser.querySelector('.user-admin').textContent = `Admin: ${user.admin ? 'Yes' : 'No'}`;

    usersContainer.appendChild(newUser);
  });
}