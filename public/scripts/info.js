function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


async function loadUserData() {
    const userId = getQueryParam('id');
    if (!userId) {
        document.getElementById('user-info').innerHTML = '<p class="error-message">User ID not found in the URL.</p>';
        return;
    }
    try {
        const response = await fetch(`/api/v1/user/${userId}`);
        const {user} = await response.json();
        console.log(user);
        // Display user information
        const userInfoContainer = document.getElementById('user-info');
        userInfoContainer.innerHTML = `
            <div class="user-card">
                <div class="user-header">
                    <img src="${user.imagePath || 'default-profile.png'}" alt="${user.firstName}'s profile picture" class="user-image">
                    <h2>${user.firstName}</h2>
                </div>
                <div class="user-details">
                    <p><i class="fas fa-envelope"></i> ${user.email}</p>
                    <p><i class="fas fa-graduation-cap"></i> ${user.batch}</p>
                    <p><i class="fas fa-info-circle"></i> Other info...</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching user data:', error);
        document.getElementById('user-info').innerHTML = '<p class="error-message">Error loading user data.</p>';
    }
}
// Initial load
document.addEventListener('DOMContentLoaded', loadUserData);