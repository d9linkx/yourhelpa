document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('error-message');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const togglePassword = document.getElementById('toggle-password');

    // Password toggle logic
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const eyeIcon = togglePassword.querySelector('.eye-icon');
            const eyeOffIcon = togglePassword.querySelector('.eye-off-icon');
            if (eyeIcon) eyeIcon.style.display = type === 'password' ? 'block' : 'none';
            if (eyeOffIcon) eyeOffIcon.style.display = type === 'password' ? 'none' : 'block';
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessageDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const result = await window.callGoogleSheet('login', { email, password });
            
            // Store user session in localStorage (Simple simulation)
            localStorage.setItem('helpa_user', JSON.stringify(result.user));
            
            window.location.href = 'helpa-dashboard.html';
        } catch (error) {
            errorMessageDiv.textContent = error.message || 'Invalid login credentials.';
            errorMessageDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
});