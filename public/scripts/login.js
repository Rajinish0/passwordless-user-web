document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const loginData = {
        email,
        password
    };

    try {
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        console.log('here now');
        const data = await response.json();
        if (!response.ok) {
            console.log(data, data.msg);
            if (data.msg === 'Not Verified'){
                console.log("redirecting to req ver");
                window.location.href = `req-verif.html?id=${data.id}`;
                return;
            }
            throw new Error('Login failed');
        }

        localStorage.setItem('userId', data.userId);
        localStorage.setItem('expiresAt', data.expiresAt);
        console.log(localStorage);
        // Redirect to the user's profile or another page

        console.log('redirecting');
        window.location.href = 'index.html';

    } catch (error) {
        console.log(error);
        console.log('doing it');
        const errElem = document.getElementById('error-message');
        errElem.textContent = 'Invalid email or password';
        errElem.classList.remove('hidden-elem');
    }
});
