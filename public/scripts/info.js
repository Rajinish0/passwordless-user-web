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
                    <h2>${user.firstName} ${user.lastName}</h2>
                </div>
                <div class="user-details">
                    <p><i class="fas fa-envelope"></i> ${user.email}</p>
                    <p><i class="fas fa-graduation-cap"></i> ${user.batch}</p>
                    ${user.phoneNum ? `<p><i class='fas fa-phone'></i> ${user.phoneNum}</p>` : ''}
                    <div class="social-links">
                        ${user.facebook ? `<a href="${user.facebook}" target="_blank"><i class="fab fa-facebook"></i> Facebook</a>` : ''}
                        ${user.instagram ? `<a href="${user.instagram}" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>` : ''}
                    </div>
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