function initializeLoginPage() {
    console.log('Initializing Login Page - v' + new Date().toISOString());
    const loginForm = document.getElementById('login-form');
    if (!loginForm) {
        console.log('Login form not found on this page. Skipping login logic.');
        return; // Exit if the form is not on this page
    }

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('error-message');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (!submitBtn) console.warn('Login submit button not found inside login-form.');
    const togglePassword = document.getElementById('toggle-password');

    // --- UI Helper Functions ---
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

    // --- Password Toggle Functionality ---
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

    // --- Logic to Verify Role and Redirect ---
    const verifyAndRedirect = async (user) => {
        const sb = window.supabase;
        setLoadingState(true, 'Verifying account...');
        try {
            const { data: helpaProfile, error: profileError } = await sb
                .from('helpas')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) {
                console.error('Error checking helpa profile:', profileError);
                show_error('Could not verify user role. Please try again.');
                setLoadingState(false, 'Login');
                return;
            }

            // Success path: redirect based on whether a helpa profile exists
            if (helpaProfile) {
                // Optionally store minimal profile for quick access (not required)
                try { localStorage.setItem('helpa_profile', JSON.stringify(helpaProfile)); } catch (e) { /* ignore */ }
                setLoadingState(true, 'Redirecting to Helpa Dashboard...');
                window.location.href = 'helpa-dashboard.html';
            } else {
                await sb.auth.signOut();
                show_error('Account not found. Please <a href="signup.html" style="text-decoration: underline;">sign up</a> or check your password.');
                setLoadingState(false, 'Login');
            }

        } catch (innerErr) {
            console.error('Unexpected error while fetching helpa profile:', innerErr);
            show_error('An unexpected error occurred. Please try again.');
            setLoadingState(false, 'Login');
        }
    };

    // --- Form Submission Handler ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessageDiv.style.display = 'none'; // Clear previous errors
        setLoadingState(true, 'Logging in...');

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            // Guard: ensure the Supabase auth client is available
            const sb = window.supabase;
            if (!sb || !sb.auth || typeof sb.auth.signInWithPassword !== 'function') {
                console.error('Supabase auth is not available', sb);
                show_error('Authentication service not available. Check console for initialization errors.');
                setLoadingState(false, 'Login');
                return;
            }

            const { data, error } = await sb.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                handleAuthError(error);
                setLoadingState(false, 'Login');
                return;
            }

            const user = data?.user;
            if (!user) {
                show_error('Login failed. Please check your credentials.');
                setLoadingState(false, 'Login');
                return;
            }

            // We have a logged-in user. Verify role and redirect.
            await verifyAndRedirect(user);

        } catch (error) {
            console.error('An unexpected error occurred during login:', error);
            show_error(error.message || 'An unexpected error occurred. Please try again.');
            setLoadingState(false, 'Login');
        }
    });

    // --- Helper for Auth Errors ---
    function handleAuthError(error) {
        if (error.message.includes("Invalid login credentials")) {
            show_error("Invalid email or password. Please try again.");
        } else {
            show_error(error.message);
        }
    }
}

// Initialize when DOM is ready
// Expose to window so includes.js can call it
window.initializeLoginPage = initializeLoginPage;