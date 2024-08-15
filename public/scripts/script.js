let currentPage = 1;
const limit = 12; // Increased to show more cards per page
const USERS_ENDPOINT = '/api/v1/user'

async function loadUsers(page = 1) {
    try {
        const response = await fetch(USERS_ENDPOINT+`?page=${page}&limit=${limit}`);
        const data = await response.json();
        
        const userList = document.getElementById('user-list');
        userList.innerHTML = ''; // Clear previous users

        data.users.forEach(user => {
            const uC = document.createElement('button');
            uC.classList.add("user-card-button");
            const userCard = document.createElement('div');
            userCard.className = 'user-card';

            // Add user image
            const userImage = document.createElement('img');
            userImage.src = user.imagePath;
            userImage.alt = `${user.firstName}'s profile picture`;
            userCard.appendChild(userImage);

            // Add user name
            const userName = document.createElement('h3');
            userName.textContent = user.firstName;
            userCard.appendChild(userName);

            // Add user email
            const userEmail = document.createElement('p');
            userEmail.textContent = user.email;
            userCard.appendChild(userEmail);

            userCard.addEventListener('click', () => {
                window.location.href = `info.html?id=${user._id}`;
            });
            
            uC.appendChild(userCard);
            userList.appendChild(uC);
        });

        // Update pagination controls
        document.getElementById('page-info').textContent = `Page ${page}`;
        document.getElementById('prev-btn').disabled = page === 1;
        document.getElementById('next-btn').disabled = page >= data.totalPages;

    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Event listeners for pagination buttons
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadUsers(currentPage);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentPage++;
    loadUsers(currentPage);
});


siteButton.addEventListener('click', 
    ()=>{
        currentPage = 1;
        loadUsers(currentPage);
    }
)


document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});