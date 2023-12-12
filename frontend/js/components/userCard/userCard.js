import { fetchAuth, fetchUpload, fetchUser, loadHTMLComponent } from "../../api/fetchData.js";
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
    document.getElementById('logout').addEventListener('click', logoutUser)
    document.getElementById('saveSettings').addEventListener('click', saveSettings)
    document.getElementById('userSettingsModal').addEventListener('show.bs.modal', setupSettings)
    document.getElementById('userSettingsModal').addEventListener('hide.bs.modal', function (event) {
        console.log('Settings Modal is about to be hide')
        document.getElementById('avatarInput').value = ''

    });

    settingsListener()
}

function closeSettings() {
    const settingsModal = document.getElementById('userSettingsModal');
    if (settingsModal) {
        const modalInstance = bootstrap.Modal.getInstance(settingsModal);
        if (modalInstance) {
            modalInstance.hide();
        }
    }  
}

async function saveChangedSettings(objectData, formData) {
    console.log("SAVE SETTINGS")

    if (Object.keys(objectData).length > 0) {
        const response = await fetchUser('PATCH', null, objectData);
        if (response && response.status > 400) {
            console.log("Error while saving settings");
        }
    }
    if (formData.has('avatar')) {
        const response = await fetchUpload('POST', formData);
        console.log(await response.text())
        if (response && response.status > 400) {
            console.log("Error while saving settings");
        }
    }
}

async function saveSettings() {
    const nicknameInput = document.getElementById('nicknameInput').value;
    const userNickname = document.getElementById('nickname').innerText;
    const avatarInput = document.getElementById('avatarInput').files[0];
    const objectData = new Object();
    const formData = new FormData();

    if (userNickname != nicknameInput) {
        console.log("APPEND NICKNAME")
        objectData.nickname = nicknameInput;
    }
    if (avatarInput) {
        console.log("APPEND AVATAR")
        formData.append('avatar', avatarInput);
    }
    // const userInput = window.prompt("Please enter your password:");
    // data.validPassword = userInput // TODO: check if password is valid in backend
    await saveChangedSettings(objectData, formData);
    closeSettings()
}


function setupSettings() {
    console.log('Settings Modal is about to be shown');
    // Do the same for email
    const userNickname = document.getElementById('nickname').innerText;
    const nicknameInput = document.getElementById('nicknameInput');

    nicknameInput.value = userNickname
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
    console.log(userObject)
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