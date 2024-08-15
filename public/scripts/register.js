document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    function clearErrors() {
        errorMessage.style.display = 'none';
        document.querySelectorAll('.field-error').forEach(el => el.remove());
    }

    function displayFieldErrors(errors) {
        for (const [field, message] of Object.entries(errors)) {
            const input = document.getElementById(field);
            if (input) {
                const errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                errorElement.textContent = message;
                input.parentNode.insertBefore(errorElement, input.nextSibling);
            }
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearErrors();

        const formData = new FormData(this);

        // Disable the submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        try {
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = '/verif-conf.html'; // Redirect to verif conf page
            } else {
                // Registration failed
                if (data.msg === 'validation error' && data.details) {
                    displayFieldErrors(data.details);
                } else {
                    errorMessage.textContent = data.message || 'Registration failed. Please try again.';
                    errorMessage.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again later.';
            errorMessage.style.display = 'block';
        }
         finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
});