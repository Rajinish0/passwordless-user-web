const siteButton = document.getElementById('site-name');
const navRight = document.getElementById('right');

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function isTokenExpired() {
    const expiresAt = localStorage.getItem('expiresAt');
    return new Date().getTime() > expiresAt;
}

async function isTokenValid() {
try{
    const resp = await fetch('/api/check-auth');
    const data = await resp.json();
    return data.authenticated;
}
catch (err){
    return false;
}
    // console.log(document.cookie);
    // const token = getCookie('token');
    // const uId = getCookie('userId');
    // console.log(token, uId);
    // if (!token || !uId) return false;

    // return true
    // const now = new Date();
    // const expiration = new Date(expirationDate);
    // return now < expiration;
}

function isLoggedIn(){
    return localStorage.getItem('userId') !== null;
}

async function updateAuthUI() {
    if ( isLoggedIn() && !isTokenExpired() ) {
        navRight.innerHTML = `
            <a href="/profile.html?id=${localStorage.getItem('userId')}">Profile</a>
            <a href="#" id=logout-btn>Log out</a>
        `;
        document.getElementById('logout-btn')
                .addEventListener('click', () => {

                    fetch('/logout')
                        .then(resp=> {})
                        .catch(err=> {})

                    localStorage.removeItem('userId');
                    localStorage.removeItem('expiresAt');
                    window.location.href = 'index.html';
                    }
                )
    } else {
        navRight.innerHTML = `
        <a href="/register.html">Register</a>
        <a href="/login.html">Log in</a>
        `
        // localStorage.removeItem('userId');
    }
}

window.addEventListener('DOMContentLoaded', updateAuthUI);
