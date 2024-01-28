import { fetchAuth, loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js';
import { displayLoginError, showLogin } from '../login/login.js';
import { assembler } from '../../api/assembler.js';
import { handleRoute } from '../../router.js';

export async function showCallback() {
    try {
        await loadHTMLPage('./js/pages/callback/callback.html');
        initCss();
    
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        const response = await fetchAuth('POST', 'api-auth/', null, {
            code: code,
        });
        if (!response) return;
        const assemble = await assembler(response);

        if (response.status >= 200 && response.status < 300) {
            if (assemble['2fa_required'] === true) {
                await showLogin();
                const modal2FA = bootstrap.Modal.getInstance(
                    document.getElementById('twoFAModal')
                );
                modal2FA.show();
            } else {
                navigateTo('/home');
            }
        } else {
            navigateTo('/');
            setTimeout( () => {
                displayLoginError(assemble);
            }, 500);
        }
    } catch (error) {
        console.error('Error fetching callback.html:', error);
    }
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