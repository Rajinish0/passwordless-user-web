const errElem = document.getElementById('error-message');
const submitButton = document.querySelector('.login-btn');

function showMessage(msg){
    errElem.innerText = msg;
    errElem.classList.remove('hidden-elem');
}

let origText;

document.addEventListener('DOMContentLoaded', 
    () => {
        origText = submitButton.innerText;
    }
)


document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.innerText = 'Processing...';

    const email = document.getElementById('email').value;

    const loginData = {
        email
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
        if (!response.ok) {
            const data = await response.json();
            console.log(data, data.msg);
            if (data.msg === 'Not Verified'){
                console.log("redirecting to req ver");
                window.location.href = `req-verif.html?id=${data.id}`;
                return;
            }

            if (data.msg === 'Updated less than 30 mins ago'){
                showMessage("Your requested a link less than 30 mins ago, please wait.");
                // const errElem = document.getElementById('error-message');
                // errElem.textContent = "Your profile was updated less than 30 mins ago, please wait.";
                // errElem.classList.remove('hidden-elem');
                return;
            }

            if (data.msg === 'Invalid email'){
                showMessage("Invalid email");
                return;
            }
            throw new Error('Login failed');
        }

        // localStorage.setItem('userId', data.userId);
        // localStorage.setItem('expiresAt', data.expiresAt);
        // console.log(localStorage);
        // Redirect to the user's profile or another page

        // console.log('redirecting');
        // window.location.href = 'index.html';
        window.location.href = "update-verif-conf.html";

    } catch (error) {
        console.log(error);
        console.log('doing it');
        showMessage("Server error, please try again later");
        // const errElem = document.getElementById('error-message');
        // errElem.textContent = 'Invalid email or password';
        // errElem.classList.remove('hidden-elem');
    }

    finally{
        submitButton.disabled = false;
        submitButton.innerText = origText;
    }
});
