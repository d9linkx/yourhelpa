function initializeLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) {
        return;
    }

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('error-message');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const togglePassword = document.getElementById('toggle-password');

    // Password Toggle
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const eyeIcon = togglePassword.querySelector('.eye-icon');
            const eyeOffIcon = togglePassword.querySelector('.eye-off-icon');
            if (eyeIcon && eyeOffIcon) {
                eyeIcon.style.display = type === 'password' ? 'block' : 'none';
                eyeOffIcon.style.display = type === 'text' ? 'block' : 'none';
            }
        });
    }
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessageDiv.style.display = 'none';
        
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        const email = emailInput.value;
        const password = passwordInput.value;
        
        const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz6RLmb41mdct49ggyUB5xgFOqx7pC1qrWRRiqWW76qmZtAx9gROD5qKVMpYzh8Xg7QKw/exec";
        const loginUrl = `${SCRIPT_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

        try {
            const response = await fetch(loginUrl);
            if (!response.ok) {
                throw new Error('Network error or invalid credentials.');
            }
            const result = await response.json();

            if (result.status === 'success' && result.user) {
                // INSECURE: Storing user data in localStorage to simulate a session.
                localStorage.setItem('helpa_user', JSON.stringify(result.user));
                
                submitBtn.textContent = 'Redirecting...';
                window.location.href = 'helpa-dashboard.html';
            } else {
                throw new Error(result.message || 'Login failed.');
            }

        } catch (error) {
            console.error('Login error:', error);
            errorMessageDiv.innerHTML = error.message.includes('Invalid credentials') || error.message.includes('User not found')
                ? 'Invalid email or password.'
                : 'An error occurred. Please try again.';
            errorMessageDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// Initialize when DOM is ready
// Expose to window so includes.js can call it
window.initializeLoginPage = initializeLoginPage;