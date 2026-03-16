document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('error-message');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const togglePassword = document.getElementById('toggle-password');

    const show_error = (message) => {
        errorMessageDiv.innerHTML = message;
        errorMessageDiv.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const setLoadingState = (isLoading, message = 'Login') => {
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.textContent = message;
        }
    };

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
        setLoadingState(true, 'Logging in...');

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            if (!window.supabase) {
                throw new Error('Authentication service is not available.');
            }

            const { data, error } = await window.supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    show_error("Invalid email or password. Please try again.");
                } else if (error.message.includes("Email not confirmed")) {
                    show_error('Please verify your email address before logging in. Check your inbox for a verification link.');
                } else {
                    show_error(error.message);
                }
                setLoadingState(false, 'Login');
                return;
            }

            if (data.user) {
                setLoadingState(true, 'Redirecting...');
                // Role-based redirection
                const userRole = data.user.user_metadata?.role;
                if (userRole === 'admin') {
                    window.location.href = 'dashboard-admin.html';
                } else if (userRole === 'helpa') {
                    window.location.href = 'helpa-dashboard.html';
                } else {
                    // Default to user dashboard for 'customer' role or if role is not set
                    window.location.href = 'dashboard-user.html';
                }
            } else {
                show_error('Login failed. Please check your credentials.');
                setLoadingState(false, 'Login');
            }

        } catch (error) {
            console.error('Login error:', error);
            show_error(error.message || 'An unexpected error occurred. Please try again.');
            setLoadingState(false, 'Login');
        }
    });
});