const errDiv = document.getElementById("error-message");
const confDialog = document.getElementById("confirm-dialog");
const confYes = document.getElementById("confirm-yes");
const confNo = document.getElementById("confirm-no");

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function showNotification(message, postAction) {
    const modal = document.getElementById('notification-modal');
    const messageEl = document.getElementById('notification-message');
    const closeBtn = document.getElementById('close-notification');
    
    messageEl.textContent = message;
    modal.style.display = 'flex';

    closeBtn.onclick = function() {
        modal.style.display = 'none';
        postAction();
    }

    // Close the modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            postAction();
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    function clearErrors() {
        errDiv.style.display = 'none';
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
    const userId = getQueryParam('id');
    
    if (!userId) {
        window.location.href = 'update.html'; // Redirect to login if no userId in localStorage
        return;
    }
    
    try {
        const response = await fetch(`/api/v1/prot/getuser/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const { user } = await response.json();

        console.log(user);
        
        // Display user profile form
        const profileContainer = document.getElementById('profile-container');
        profileContainer.innerHTML = `
        <form id="profile-form" enctype="multipart/form-data">
            <div class="profile-card">
                <img src="${user.imagePath}" alt="${user.firstName}">
    
                <div class="form-group">
                    <h2>${user.firstName}</h2>
                </div>
    
                <div class="form-group">
                    <label for="firstName">First Name:</label>
                    <input type="text" id="firstName" name="firstName" value="${user.firstName}" minlength=3 maxlength=50>
                </div>
                
                <div class="form-group">
                    <label for="lastName">Last Name:</label>
                    <input type="text" id="lastName" name="lastName" value="${user.lastName}" minlength=3 maxlength=50>
                </div>

                <div class="form-group">
                    <label for="batch">Batch:</label>
                    <input type="number" id="batch" name="batch" value="${user.batch}" min=1960>
                </div>

                <div class="form-group">
                    <label for="phoneNum">Phone Number: </label>
                    <input type="string" id="phoneNum" name="phoneNum" value="${user.phoneNum}">
                </div>

                <div class="form-group">
                    <label for="facebook">Facebook URL:</label>
                    <input type="url" id="facebook" name="facebook" value="${user.facebook}">
                </div>

                <div class="form-group">
                    <label for="instagram">Instagram URL:</label>
                    <input type="url" id="instagram" name="instagram" value="${user.instagram}">
                </div>
                
                <div class="form-group">
                    <label for="photo">Update profile Image:</label>
                    <input type="file" id="photo" name="photo" accept="image/*">
                </div>

                <div id="opts">
                    <button type="submit" id="submit-btn" class="submit-btn">Update Profile</button>
                    <button id="delete-btn" class="delete-btn">Delete Profile</button>
                </div>

                <div id="f-error-message" class="error-message"></div>
            </div>
        </form>
    `;
    
        
        const profileForm = document.getElementById('profile-form');
        const submitButton = document.getElementById('submit-btn');
        const deleteButton = document.getElementById('delete-btn');
        const ferrDiv = document.getElementById("f-error-message");
        console.log(submitButton);
        submitButton.addEventListener('click', async (event) => {
            event.preventDefault();
            clearErrors();

            const formData = new FormData(profileForm);
            
            // const formData = {
            //     firstName: document.getElementById('firstName').value.trim(),
            //     password: document.getElementById('password').value.trim(),
            //     batch: document.getElementById('batch').value.trim(),
            // };
            
            // Check if there were changes
            // const changes = {};
            // if (formData.get('firstName').trim() === user.firstName) 
                // formData.delete('firstName');
            // if (!formData.get('password').trim())
                // formData.delete('password');
            // if (formData.get('batch').trim() === user.batch) 
                // formData.delete('batch');
            
            // if (Object.keys(changes).length === 0) {
            //     return; // No changes to submit
            // }
            
            try {
                const updateResponse = await fetch(`/api/v1/user/${userId}`, {
                    method: 'PUT',
                    body: formData,
                });

                console.log('here!!');
                
                if (!updateResponse.ok) {
                    const data = await updateResponse.json();
                    if (updateResponse.status === 401) {
                        showNotification("You are unauthorized, please log in again", ()=>{
                            window.location.href = 'update.html';
                        });
                    } else if (data.msg === 'Validation failed' && data.details) {
                        displayFieldErrors(data.details);
                    } else if (data.msg === 'File mimetype must be image' || 
                               data.msg === 'Invalid image extension'
                    ){
                        const input = document.getElementById('photo');
                        const errorElement = document.createElement('div');
                        errorElement.className = 'field-error';
                        errorElement.textContent = "Invalid image file";
                        input.parentNode.insertBefore(errorElement, input.nextSibling);
                    } else {
                        console.log("HERE NOW");
                        ferrDiv.textContent = 'Failed to update profile. Please try again later.';
                        ferrDiv.style.display = 'flex';
                    }
                    return;
                }
                
                // Successfully updated
                showNotification('Profile updated successfully', () => {
                    window.location.href = 'index.html';
                });
            } catch (error) {
                console.error('Error updating profile:', error);
                ferrDiv.textContent = 'Failed to update profile. Please try again later.';
                ferrDiv.style.display = 'flex';
            }
        });

        confYes.addEventListener('click', async () => {
            confDialog.style.display = 'none';
            try{
                const deleteResponse = await fetch(`/api/v1/user/${userId}`, {
                    method: 'DELETE',
                });

                if (!deleteResponse.ok){
                    if (deleteResponse.status === 401) {
                        showNotification("You are unauthorized, please log in again");
                        window.location.href = 'update.html'; // Redirect if unauthorized
                    } 
                    else {
                        console.log("HERE NOW");
                        ferrDiv.textContent = 'Failed to delete profile. Please try again later.';
                        ferrDiv.style.display = 'flex';
                    }
                }
                else{
                    showNotification("profile deleted");
                    window.location.href = "index.html";
                }
            }
            catch (err){
                console.log('here')
                console.log(err);
                ferrDiv.textContent = 'Failed to delete profile. Please try again later.';
                ferrDiv.style.display = 'flex';
            }
        })

        confNo.addEventListener('click', () => {
            confDialog.style.display = 'none';
        })

        deleteButton.addEventListener('click', (e)=> {
            e.preventDefault();
            confDialog.style.display = 'flex'
        })

        confDialog.addEventListener('onblur', (e) => {
            confDialog.style.display = 'none';
        })

        
    } catch (error) {
        // console.error('Error fetching user profile:', error);
        errDiv.textContent = `Failed to load profile. Please try again later`;
        errDiv.style.display = 'block';
    }
});
