import { fetchUser } from '../../api/fetchData.js';
import { loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js';
import { fetchAuth } from '../../api/fetchData.js';
import { displayAlertMsg } from '../../utils/utilityFunctions.js';

export async function showSignUp() {
    try {
        await loadHTMLPage('./js/pages/signUp/signUp.html');
        document
            .getElementById('signupForm')
            .addEventListener('submit', function (event){
                event.preventDefault();
                signUp();
            });
        document.getElementById('btnAlertCloseSignup').addEventListener('click', hideSignupAlert)
        document.getElementById('loginUpButton').addEventListener('click', function () {
            navigateTo('/login');
        });
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
    } catch (error) {
        console.error('Error fetching signUp.html:', error);
    }
}

async function loginAfterSignup(nickname, password) {
    const loginData = {
        nickname,
        password,
    };
    try {
        const response = await fetchAuth('POST','login/', loginData);
        if (response.ok) {
            navigateTo('/home');
            return ;
        } else {
            const result = await response.text();
            displaySignupError(result)
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function signUp() {
    const nickname = document.getElementById('inputUsername').value;
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;
    const passwordConfirm = document.getElementById(
        'inputPasswordConfirm'
    ).value;
    if (!nickname || !email || !password || !passwordConfirm) {
        return;
    }
    if (password !== passwordConfirm) {
        displaySignupError('Passwords do not match');
        return;
    }
    const userData = {
        nickname,
        email,
        password,
        passwordConfirm,
    };
    const users = await fetchUser('POST', null, userData);
    if (!users) {
        return;
    }
    const responseText = await users.text();
    if (!users.ok) { displaySignupError(responseText); }
    else { loginAfterSignup(nickname, password); }
}

function displaySignupError(errorMessage) {
    const errorAlert = document.getElementById('alertErrorSignup');
    displayAlertMsg(errorMessage, errorAlert);
    errorAlert.classList.add('show');
    errorAlert.classList.remove('hide');
}


function hideSignupAlert() {
    const errorAlert = document.getElementById('alertErrorSignup');
    errorAlert.classList.remove('show');
    errorAlert.classList.add('hide');
}