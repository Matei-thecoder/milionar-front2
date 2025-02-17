let userId;
let username;
let money;

window.onload = async function () {
    await getData();
    if (userId && username && money !== undefined) {
        showHome(username, money);
    } else {
        showStart();
    }
};

async function getData() {
    userId = localStorage.getItem('userId');  // Get the userId from localStorage
    console.log('User ID from localStorage:', userId);

    if (userId) {
        try {
            const response = await fetch(`http://localhost:3000/user/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                console.log('Fetched user data:', userData); // Log the user data

                // Ensure that the response contains the expected data
                if (userData && userData.username && userData.money !== undefined) {
                    username = userData.username;
                    money = userData.money;

                    // Store user data in localStorage for future use
                    localStorage.setItem('username', username);
                    localStorage.setItem('money', money);
                } else {
                    console.error('User data is missing username or money');
                    //showStart();  // If data is missing, show the start screen
                }
            } else {
                console.error('User not found or error fetching data');
                //showStart();
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
           // showStart();  // On error, show the start screen
        }
    } else {
        console.log('No userId found in localStorage');
       // showStart();  // If userId is not found, show the start screen
    }
}



async function showLogin() {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('login-menu').classList.remove('hidden');
}

async function showSignup() {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('signup-menu').classList.remove('hidden');
}

async function showStart() {
    document.querySelectorAll('.menu').forEach(menu => menu.classList.add('hidden'));
    document.getElementById('start-menu').classList.remove('hidden');
}

async function showHome() {
    await getData(); // Wait for data to be fetched
    let username= localStorage.getItem('username');
    let money = localStorage.getItem('money');
    console.log('User data inside showHome - Username:', username, 'Money:', money);

    if (username !== undefined && money !== undefined) {
        document.querySelectorAll('.menu').forEach(menu => menu.classList.add('hidden'));
        document.getElementById('home-menu').classList.remove('hidden');
        document.getElementById('username').innerText = username;
        document.getElementById('money').innerText = money;
    } else {
        console.error("Error: Data is undefined");
        //showStart();
        document.querySelectorAll('.menu').forEach(menu => menu.classList.add('hidden'));
        document.getElementById('home-menu').classList.remove('hidden');
        document.getElementById('username').innerText = username;
        document.getElementById('money').innerText = money;
    }
}


async function startGame() {
    document.querySelectorAll('.menu').forEach(menu => menu.classList.add('hidden'));
    document.getElementById('game-menu').classList.remove('hidden');
    await fetchQuestion();
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.user) {
            localStorage.setItem('userId', data.user.userId);
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('money', data.user.money);
            userId = data.user.userId;
            money = data.user.money;
            username = data.user.username;
            showHome(username, money);
        } else {
            alert('Login failed');
        }
    } catch (error) {
        alert('Error occurred during login');
    }
}

async function signup() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        const res = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (data.message) {
            alert('Signup successful');
        } else {
            alert('Signup failed');
        }
    } catch (error) {
        alert('Error occurred during signup');
    }
}

async function fetchQuestion() {
    try {
        const res = await fetch('http://localhost:3000/question');
        
        if (!res.ok) {
            throw new Error('Failed to fetch question');
        }

        const data = await res.json();

        document.getElementById('question-text').innerText = data.question;
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        // Clear previous result messages
        const resultContainer = document.getElementById('result-container');
        resultContainer.innerHTML = '';

        data.options.forEach(opt => {
            const button = document.createElement('button');
            button.innerText = opt;

            button.onclick = () => {
                const isCorrect = data.answer === opt;

                // Display the appropriate success or failure message
                if (isCorrect) {
                    resultContainer.innerHTML = 'Correct! 🎉';
                    resultContainer.style.color = 'green';
                    updateMoney(100);
                } else {
                    resultContainer.innerHTML = 'Incorrect! 😞';
                    resultContainer.style.color = 'red';
                    updateMoney(-50);
                }

                // Disable all option buttons after selecting an answer
                optionsContainer.querySelectorAll('button').forEach(button => button.disabled = true);
            };

            optionsContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Error fetching question:', error);
        alert('Error fetching question');
    }
}

async function updateMoney(amount) {
    try {
        money = money+ amount;
        localStorage.setItem('money', money);
        userId = localStorage.getItem('userId');
        const res = await fetch('http://localhost:3000/update-money', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, amount })
        });
        const data = await res.json();
        document.getElementById('money').innerText = data.money;
    } catch (error) {
        console.log(error);
        alert('Error updating money');
    }
}

async function logout() {
    showStart();
}
