import { supabase } from './js/supabase-client.js';

// Handle logout
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

/**
 * Checks for a valid user session and ensures the user has the 'helpa' role.
 * Redirects to login if the checks fail.
 */
async function getHelpaUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        window.location.href = 'login.html';
        return null;
    }

    const user = session.user;
    const userRole = user.user_metadata?.role;

    if (userRole !== 'helpa') {
        alert('Access denied. You are not a Helpa.');
        window.location.href = 'dashboard-user.html'; // or login.html
        return null;
    }

    return user;
}

async function loadHelpaDashboard() {
    const helpa = await getHelpaUser();
    if (!helpa) return;

    document.getElementById('helpa-name').textContent = helpa.user_metadata?.first_name || helpa.email;

    // Fetch both transactions and services in parallel
    const [
        { data: transactions, error: transactionsError },
        { data: services, error: servicesError }
    ] = await Promise.all([
        supabase.from('transactions').select('*').eq('helpa_id', helpa.id),
        supabase.from('services').select('*').eq('provider_id', helpa.id)
    ]);

    // Render assigned transactions
    const transactionsList = document.getElementById('transactions-list');
    if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        document.getElementById('transactions-list').innerHTML = '<p class="error">Could not load transactions.</p>';
    } else {
        transactionsList.innerHTML = transactions.length > 0
            ? transactions.map(tx => `
                <div class="transaction-item"><a href="transaction-detail.html?id=${tx.id}">${tx.description}</a> - Status: <strong>${tx.status}</strong></div>
              `).join('')
            : '<p>You have no assigned transactions yet.</p>';
    }

    // Render offered services
    const servicesList = document.getElementById('services-list');
    if (servicesError) {
        console.error('Error fetching services:', servicesError);
        servicesList.innerHTML = '<p class="error">Could not load your services.</p>';
    } else {
        servicesList.innerHTML = services.length > 0
            ? services.map(service => `
                <div class="service-item">
                    <span>${service.title} - $${service.price}</span>
                    <a href="service-edit.html?id=${service.id}" class="button-secondary">Edit</a>
                </div>
              `).join('')
            : '<p>You have not added any services yet.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadHelpaDashboard);