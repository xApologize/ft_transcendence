///////////////////////
//
// Gros test dégueulasse pour des exemples simple de comment fetch le backend et l'afficher.
//
///////////////////////


// Afficher user spécifique
document.getElementById('getUser').addEventListener('click', function () {
    const nickname = document.getElementById('nicknameInput').value;

    if (!nickname) {
      alert('Please enter a nickname.');
      return;
    }

    // Replace 'your-backend-url' with the actual URL of your backend API.
    fetch(`https://localhost:52021/api/user/?nickname=${nickname}`)
      .then(response => {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 404) {
            // User not found
            document.getElementById('errorMessage').textContent = 'User not found.';
            document.getElementById('errorMessage').style.color = 'red';
            return Promise.reject('User not found.');
        } else {
            // Handle other HTTP status codes as needed
            throw new Error('Failed to fetch user');
        }
      })
      .then(data => {
        const userData = document.getElementById('userData');
        userData.innerHTML = ''; // Clear previous data

        if (data.users && data.users.length > 0) {
          const user = data.users[0];

          const userDiv = document.createElement('div');
          userDiv.className = 'user-container';

          const avatarDiv = document.createElement('div');
          avatarDiv.className = 'avatar-container';
          const avatar = document.createElement('img');
          avatar.src = user.avatar;
          avatar.alt = `Avatar of ${user.nickname}`;
          avatarDiv.appendChild(avatar);

          const userInfoDiv = document.createElement('div');
          userInfoDiv.className = 'user-info';

          const nickname = document.createElement('p');
          nickname.textContent = `Nickname: ${user.nickname}`;

          const email = document.createElement('p');
          email.textContent = `Email: ${user.email}`;

          const status = document.createElement('p');
          status.textContent = `Status: ${user.status}`;

          const admin = document.createElement('p');
          admin.textContent = `Admin: ${user.admin ? 'Yes' : 'No'}`;

          userInfoDiv.appendChild(nickname);
          userInfoDiv.appendChild(email);
          userInfoDiv.appendChild(status);
          userInfoDiv.appendChild(admin);

          userDiv.appendChild(avatarDiv);
          userDiv.appendChild(userInfoDiv);

          userData.appendChild(userDiv);
        } else {
          userData.textContent = 'User not found.';
        }
      })
      .catch(error => console.error('Error:', error));
  });


// Afficher tous les users
document.getElementById('getUsers').addEventListener('click', function () {
    fetch('https://localhost:52021/api/user/')
      .then(response => response.json())
      .then(data => {
        const userData = document.getElementById('userData');
        userData.innerHTML = ''; // Clear previous data
        data.users.forEach(user => {
          const userDiv = document.createElement('div');
          userDiv.className = 'user-container';

          const nickname = document.createElement('p');
          nickname.textContent = `Nickname: ${user.nickname}`;

          const email = document.createElement('p');
          email.textContent = `Email: ${user.email}`;

          const avatar = document.createElement('img');
          avatar.src = user.avatar;
          avatar.alt = `Avatar of ${user.nickname}`;

          const status = document.createElement('p');
          status.textContent = `Status: ${user.status}`;

          const admin = document.createElement('p');
          admin.textContent = `Admin: ${user.admin ? 'Yes' : 'No'}`;

          userDiv.appendChild(nickname);
          userDiv.appendChild(email);
          userDiv.appendChild(avatar);
          userDiv.appendChild(status);
          userDiv.appendChild(admin);

          userData.appendChild(userDiv);
        });
      })
      .catch(error => console.error('Error:', error));
  });

// Delete what is currently shown
document.getElementById('reset').addEventListener('click', function () {
    const userData = document.getElementById('userData');
    const errorMessage = document.getElementById('errorMessage');

    userData.innerHTML = ''; // Clear previous data
    errorMessage.innerHTML = ''
});

// Create a new users
document.getElementById('createUser').addEventListener('click', function () {
    const nickname = document.getElementById('userInput').value;
    const email = document.getElementById('emailInput').value;
    const avatar = document.getElementById('avatarInput').value;
  
    if (!nickname || !email || !avatar) {
      alert('Please enter all required fields.');
      return;
    }
  
    const userData = {
      nickname,
      email,
      avatar,
      status: "ONL", // Set the default status here
      admin: false, // Set the default admin value here
    };
  
    fetch('https://localhost:52021/api/user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData), // Convert the object to JSON
    })
      .then(response => {
        if (response.status === 201) {
          // User created successfully
          document.getElementById('errorMessage').textContent = `User ${nickname} created successfully`;
          document.getElementById('errorMessage').style.color = 'green';
        } else if (response.status === 400) {
          return response.json();
        } else {
          // Handle other HTTP status codes as needed
          throw new Error('Failed to create user');
        }
      })
      .then(data => {
        if (data.error) {
          // Display the specific error message
          document.getElementById('errorMessage').textContent = data.error;
          document.getElementById('errorMessage').style.color = 'red';
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });