import { fetchAuth, loadHTMLComponent } from "../../api/fetchData.js";
import { navigateTo } from "../../router.js";

export async function userCardComponent() {
    try {
        const userTemplate = await loadHTMLComponent('./js/components/userCard/userCard.html');
        return userTemplate
    } catch (error) {
        console.error('Error fetching userCard:', error);
    }
}

export async function userCardListener() {
    document.getElementById('logout').addEventListener('click', async () => {
        await logoutUser()
    })


    document.getElementById('userSettingsModal').addEventListener('show.bs.modal', function (event) {
        console.log('Settings Modal is about to be shown');
    });


    document.getElementById('userSettingsModal').addEventListener('hide.bs.modal', function (event) {
        console.log('Settings Modal is about to be hide')
    });


    document.getElementById('editNicknameBtn').addEventListener('click', function(event) {
        const nicknameText = document.getElementById('nicknameText');
        const nicknameInput = document.getElementById('nicknameInput');
        const editBtn = document.getElementById('editNicknameBtn');

        // Toggle visibility of the text and input fields
        nicknameText.style.display = (nicknameText.style.display === 'none') ? 'inline' : 'none';
        nicknameInput.style.display = (nicknameInput.style.display === 'none') ? 'inline' : 'none';

        // If the input field is visible, focus on it
        if (nicknameInput.style.display !== 'none') {
            nicknameInput.value = nicknameText.innerText.trim();
            nicknameInput.focus();
        }

        // Change the button text based on the state
        editBtn.innerText = (nicknameText.style.display === 'none') ? 'Save' : 'Edit';

        // If the input field is visible and the button text is 'Save', update the text
        if (nicknameInput.style.display === 'none' && editBtn.innerText === 'Edit') {
            nicknameText.innerText = nicknameInput.value.trim();
        }
        document.getElementById('cancelNicknameBtn').classList.toggle('hide')
    });


    document.getElementById('cancelNicknameBtn').addEventListener('click', function(event) {
        const nicknameText = document.getElementById('nicknameText');
        const nicknameInput = document.getElementById('nicknameInput');
        const cancelBtn = document.getElementById('cancelNicknameBtn');

        // Toggle visibility of the text and input fields
        nicknameText.style.display = (nicknameText.style.display === 'none') ? 'inline' : 'none';
        nicknameInput.style.display = (nicknameInput.style.display === 'none') ? 'inline' : 'none';

        // If the text field is visible, update the input value
        if (nicknameText.style.display !== 'none') {
            nicknameInput.value = nicknameText.innerText.trim();
        }

        // Toggle visibility of the cancel button
        cancelBtn.classList.toggle('hide');

        const editBtn = document.getElementById('editNicknameBtn');
        editBtn.innerText = (nicknameText.style.display === 'none') ? 'Save' : 'Edit';

    });


    settingsListener()
}

function settingsListener() {
    // Left column listener
    document.querySelectorAll('.left-column-settings i').forEach(function(icon) {
            icon.addEventListener('click', function() {
            document.querySelectorAll('.left-column-settings i').forEach(function(icon) {
                icon.classList.remove('active');
            });
            icon.classList.add('active');
            document.querySelectorAll('.right-column-settings .collapse').forEach(function(menu) {
                menu.classList.remove('show');
            });
            const targetMenuId = icon.getAttribute('data-bs-target').substring(1);
            const targetMenu = document.getElementById(targetMenuId);
            targetMenu.classList.add('show');
        });
    });

}

async function logoutUser() {
    console.log('logout!')
    const logoutResponse = await fetchAuth('POST', 'logout/')
    if (logoutResponse.status == 200) {
        sessionStorage.clear()
        navigateTo('/')
    }
    return ;
}

// Call in home.js
export async function displayUserCard(meUser) {
    let userContainer = document.getElementById('own-user-card');

    let userCard = await userCardComponent();
    userContainer.appendChild(userCard);
    userCardListener(); // enable js on the userCard
    updateUserCard(meUser);
}

function updateUserCard(userObject) {
    const profilePicture = document.getElementById('avatar-img');
    profilePicture.src = userObject.avatar;

    const nicknameElement = document.getElementById('nickname');
    nicknameElement.querySelector('h5').innerText = userObject.nickname;

    const winsElement = document.getElementById('wins');
    const lossesElement = document.getElementById('losses');
    const gamesPlayedElement = document.getElementById('game-played');

    winsElement.innerText = userObject.won_matches.length;
    lossesElement.innerText = userObject.lost_matches.length;
    gamesPlayedElement.innerText = userObject.played_matches.length;
}