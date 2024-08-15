document.addEventListener('DOMContentLoaded', async () => {
    const navRight = document.querySelector('.nav-right');
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        // alert("You are not authorized, please log in again")
        window.location.href = 'login.html'; // Redirect to login if no userId in localStorage
        return;
    }
    
    try {
        const response = await fetch(`/api/v1/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const { user } = await response.json();
        
        // Display user profile form
        const profileContainer = document.getElementById('profile-container');
        profileContainer.innerHTML = `
            <form id="profile-form" enctype="multipart/form-data">
                <div class="profile-card">
                    <img src="${user.imagePath}" alt="${user.firstName}">
                    <h2>${user.firstName}</h2>
                    
                    <label for="firstName">First Name:</label>
                    <input type="text" id="firstName" name="firstName" value="${user.firstName}" minlength=3>
                    
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" placeholder="Enter new password" minlength=8>
                    
                    <label for="batch">Batch:</label>
                    <input type="number" id="batch" name="batch" value="${user.batch}" min=1940>
                    
                    <label for="photo">Update profile Image:</label>
                    <input type="file" id="photo" name="photo" accept="image/*">

                    <button type="submit">Update Profile</button>
                </div>
            </form>
            <div id="error-message"></div>
        `;
        
        const profileForm = document.getElementById('profile-form');
        profileForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(profileForm);
            
            // const formData = {
            //     firstName: document.getElementById('firstName').value.trim(),
            //     password: document.getElementById('password').value.trim(),
            //     batch: document.getElementById('batch').value.trim(),
            // };
            
            // Check if there were changes
            // const changes = {};
            if (formData.get('firstName').trim() === user.firstName) 
                formData.delete('firstName');
            if (!formData.get('password').trim())
                formData.delete('password');
            if (formData.get('batch').trim() === user.batch) 
                formData.delete('batch');
            
            // if (Object.keys(changes).length === 0) {
            //     return; // No changes to submit
            // }
            
            try {
                const updateResponse = await fetch(`/api/v1/user/${userId}`, {
                    method: 'PUT',
                    body: formData,
                });
                
                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json();
                    if (updateResponse.status === 401) {
                        alert("You are unauthorized, please log in again");
                        window.location.href = 'login.html'; // Redirect if unauthorized
                    } else if (errorData.details && errorData.details.password) {
                        document.getElementById('error-message').textContent = errorData.details.password;
                    } else {
                        document.getElementById('error-message').textContent = 'Failed to update profile. Please try again later.';
                    }
                    return;
                }
                
                // Successfully updated
                alert('Profile updated successfully');
                window.location.reload(); // Reload the page to reflect changes
            } catch (error) {
                console.error('Error updating profile:', error);
                document.getElementById('error-message').textContent = 'Failed to update profile. Please try again later.';
            }
        });
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
        document.getElementById('profile-container').innerHTML = `<p>Failed to load profile. Please try again later.</p>`;
    }
});
