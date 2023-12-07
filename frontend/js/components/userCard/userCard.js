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
            var targetMenuId = icon.getAttribute('data-bs-target').substring(1);
            var targetMenu = document.getElementById(targetMenuId);
            targetMenu.classList.add('show');
        });
    });

    // nickname listener
    document.getElementById('editNicknameBtn').addEventListener('click', function() {
        document.getElementById('nicknameDisplay').classList.add('d-none');
        document.getElementById('editableNickname').classList.remove('d-none');
        document.getElementById('nicknameInput').value = document.getElementById('nicknameDisplay').innerText;
    });

    document.getElementById('saveNicknameBtn').addEventListener('click', function() {
        var newNickname = document.getElementById('nicknameInput').value;
        document.getElementById('nicknameDisplay').innerText = newNickname;
        document.getElementById('editableNickname').classList.add('d-none');
        document.getElementById('nicknameDisplay').classList.remove('d-none');
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