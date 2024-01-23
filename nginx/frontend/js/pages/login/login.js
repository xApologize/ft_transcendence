import { fetchInitLoginPage, loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js';
import { fetchAuth } from '../../api/fetchData.js';
import { displayAlertMsg } from '../../utils/utilityFunctions.js';
import { assembler } from '../../api/assembler.js';
import { hideModal, showModal } from '../home/utils.js';

export async function showLogin() {
    try {
        await loadHTMLPage('/js/pages/login/login.html');
        new bootstrap.Modal(document.getElementById('twoFAModal'));
        initCss();
        getIntraHref();
        initEventListeners();
    } catch (error) {
        console.error('Error fetching home.html:', error);
    }
}

async function getIntraHref() {
    const intraHrefEl = document.getElementById('intraLink');
    const intraBtn = document.getElementById('intra-button');
    const response = await fetchInitLoginPage();

    if (!response || !response.ok) {
        intraBtn.disabled = true;
        intraHrefEl.removeAttribute('href');
    } else {
        const data = await assembler(response);
        const intraLink = data['intra_link'];
        if (!intraLink) {
            intraBtn.disabled = true;
            intraHrefEl.removeAttribute('href');
        } else {
            intraHrefEl.href = intraLink;
        }
    }
}

function initEventListeners() {
    document
    .getElementById('login-form')
    .addEventListener('submit', function (event) {
        event.preventDefault();
        login();
    });

    document
        .getElementById('signUpButton')
        .addEventListener('click', () => {
            navigateTo('/signUp');
        });

    document
        .getElementById('btnAlertCloseLogin')
        .addEventListener('click', hideLoginAlert);

    document
        .getElementById('submit2FACode')
        .addEventListener('click', submit2FACode);

    document
        .getElementById('close2FAModal')
        .addEventListener('click', close2FAModal);
}

async function login(username = null, password = null) {
    const usernameInput =
        username !== null
            ? username
            : document.getElementById('validationDefault01').value;
    const passwordInput =
        password !== null
            ? password
            : document.getElementById('passwordInput').value;

    if (!usernameInput || !passwordInput) {
        return;
    }

    const loginData = {
        nickname: usernameInput,
        password: passwordInput,
    };

    try {
        const response = await fetchAuth('POST', 'login/', loginData);
        if (!response) return;
        const result = await assembler(response);
        if (typeof result === 'string') {
            displayLoginError({ error: result });
            return;
        }
        if (response.ok) {
            if (result['2fa_required']) {
                showModal('twoFAModal');
                return;
            }
            navigateTo('/home');
        } else {
            displayLoginError(result);
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function submit2FACode(result) {
    const code = document.getElementById('2faCodeInput').value;
    const response = await fetchAuth('POST', 'login2fa/', { otp_token: code });
    if (!response) {
        return;
    } // @TODO: handle error bc no token so not suppose to throw 401
    const data = await response.json();
    if (response.status == 200) {
        hideModal('twoFAModal');
        navigateTo('/home');
    } else if (response.status == 400) {
        document.getElementById('2FAErrorMsg').textContent = data.error;
    } else if (response.status == 404 || response.status == 409) {
        hideModal('twoFAModal');
        displayLoginError(data);
    } else {
        hideModal('twoFAModal');
        displayLoginError({ error: 'An error occured. Please try again.' });
    }
}

function close2FAModal() {
    hideModal('twoFAModal');
    const error = {
        error: '2FA Authentication interrupted. Please try again.',
    };
    displayLoginError(error);
}

export async function displayLoginError(message) {
    const alert = document.getElementById('alertErrorLogin');
    const msg = message.error;
    displayAlertMsg(msg, alert);
    alert.classList.remove('hide');
    alert.classList.add('show');
}

function hideLoginAlert() {
    const alert = document.getElementById('alertErrorLogin');
    alert.classList.add('hide');
    alert.classList.remove('show');
}

function initCss() {
    let canvas = document.querySelector('canvas');
    let c = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    let HorizontalArray = [];
    function Horizontal(y) {
        this.y = y;
        this.dy = 0.5;
        this.opacity = 0;

        this.draw = () => {
            c.beginPath();
            c.lineWidth = 3;
            c.strokeStyle = `rgba(255, 0, 255, ${this.opacity})`;
            c.moveTo(0, this.y);
            c.lineTo(canvas.width, this.y);
            c.stroke();
        };

        this.update = () => {
            if (this.y >= canvas.height) {
                HorizontalArray.splice(HorizontalArray.indexOf(this), 1);
            }

            this.opacity += 0.003;

            this.dy += 0.05;
            this.y += this.dy;
            this.draw();
        };
    }

    let grad = c.createLinearGradient(0, canvas.height, 0, 0);
    grad.addColorStop('0', 'rgba(255, 0, 255, 0.5)');
    grad.addColorStop('0.55', 'rgba(255, 0, 255, 0)');
    grad.addColorStop('1.0', 'rgba(255, 0, 255, 0)');
    let VerticalArray = [];
    function Vertical(x) {
        this.x = x;

        this.draw = () => {
            c.beginPath();
            c.lineWidth = 3;
            c.strokeStyle = grad;
            c.moveTo(canvas.width / 2, 200);
            c.lineTo(this.x, canvas.height);
            c.stroke();
        };

        this.update = () => {
            this.draw();
        };
    }

    let interval = canvas.width / 10;
    let cross = 0 - interval * 8;
    for (let i = 0; i < 27; i++) {
        VerticalArray.push(new Vertical(cross));
        cross += interval;
    }

    setInterval(() => {
        HorizontalArray.push(new Horizontal(canvas.height / 2));
    }, 300);

    function animate() {
        requestAnimationFrame(animate);
        c.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < HorizontalArray.length; i++) {
            HorizontalArray[i].update();
        }
        for (let i = 0; i < VerticalArray.length; i++) {
            VerticalArray[i].update();
        }
    }
    animate();
}