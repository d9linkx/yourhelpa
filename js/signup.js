document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('helpa-signup-form');
    const errorMessageDiv = document.getElementById('error-message');
    const successMessageDiv = document.getElementById('success-message');
    const submitBtn = document.getElementById('submit-btn');

    if (!signupForm) return;

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        errorMessageDiv.style.display = 'none';
        successMessageDiv.style.display = 'none';

        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        const formData = new FormData(signupForm);
        const fullName = formData.get('full-name');
        const email = formData.get('email');
        const password = formData.get('password');
        const phone = formData.get('phone-number');
        const location = formData.get('location');
        const offeringType = formData.get('offering_type');
        const service = offeringType === 'service' ? formData.get('primary_service') : formData.get('primary_product');

        try {
            // Ensure supabase client is available
            if (!window.supabase) {
                throw new Error('Authentication service is not available.');
            }

            // 1. Sign up the user in Supabase Auth
            const { data: authData, error: authError } = await window.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                    }
                }
            });

            if (authError) {
                throw authError;
            }

            if (!authData.user) {
                throw new Error("Registration succeeded but no user data was returned. Please try logging in.");
            }

            // 2. Insert a corresponding profile into the 'helpas' table
            const { error: profileError } = await window.supabase
                .from('helpas')
                .insert({
                    id: authData.user.id, // Link to the auth user
                    email: email,
                    full_name: fullName,
                    phone: phone,
                    location: location,
                    primary_service: service
                });

            if (profileError) {
                // This is a tricky state. The user is created in auth, but profile failed.
                // For now, we'll alert the user. A more robust solution might involve cleanup.
                console.error('Profile creation error:', profileError);
                throw new Error('Your account was created, but we failed to set up your Helpa profile. Please contact support.');
            }

            // 3. Show success message
            signupForm.style.display = 'none';
            document.querySelector('.auth-footer').style.display = 'none';
            successMessageDiv.innerHTML = `
                <h4>Registration Successful!</h4>
                <p>Your account has been created. Please check your email to verify your account before logging in.</p>
                <a href="login.html" class="button-primary" style="margin-top: 1rem; display: inline-block;">Go to Login</a>
            `;
            successMessageDiv.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error during signup:', error);
            errorMessageDiv.textContent = error.message || 'An unknown error occurred during registration.';
            errorMessageDiv.style.display = 'block';

            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // --- Password Toggle ---
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
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
});