import { supabase } from './supabase-client.js';

// Handle logout
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

/**
 * Checks for a valid user session and ensures the user has the 'admin' role.
 */
async function checkAdminAccess() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        window.location.href = 'login.html';
        return null;
    }

    const user = session.user;
    if (user.user_metadata?.role !== 'admin') {
        alert('Access Denied. You do not have administrator privileges.');
        // Redirect to their appropriate dashboard
        window.location.href = user.user_metadata?.role === 'helpa' ? 'helpa-dashboard.html' : 'index.html';
        return null;
    }
    return user;
}

/**
 * Fetches all users with the 'helpa' role.
 */
async function getHelpas() {
    // This assumes you have a 'profiles' table that mirrors users and has a 'role' column.
    const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, email')
        .eq('role', 'helpa');

    // Note: To create the 'profiles' table, see the prompt suggestion at the end.

    if (error) {
        console.error('Error fetching helpas:', error);
        return [];
    }
    return data;
}

/**
 * Fetches all user profiles to map IDs to names.
 */
async function getAllProfiles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, email');

    if (error) {
        console.error('Error fetching all profiles:', error);
        return [];
    }
    return data;
}

/**
 * Assigns a transaction to a Helpa.
 */
async function assignTransaction(transactionId, helpaId) {
    const { error } = await supabase
        .from('transactions')
        .update({ helpa_id: helpaId, status: 'pending' })
        .eq('id', transactionId);

    if (error) {
        alert('Failed to assign transaction. Error: ' + error.message);
    } else {
        alert('Transaction assigned successfully!');
        loadAdminDashboard(); // Refresh the dashboard
    }
}

/**
 * Updates a user's role in the profiles table.
 * NOTE: This requires a Supabase Edge Function for full security to also update auth.users metadata.
 * For now, this updates the 'profiles' table which our RLS relies on.
 */
async function updateUserRole(userId, newRole) {
    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) {
        alert(`Failed to update role: ${error.message}`);
    } else {
        alert('User role updated successfully!');
        loadAdminDashboard(); // Refresh to show the change
    }
}

/**
 * Loads the main dashboard content.
 */
async function loadAdminDashboard() {
    const adminUser = await checkAdminAccess();
    const searchInput = document.getElementById('search-transactions');
    const statusFilter = document.getElementById('filter-status');

    if (!adminUser) return;

    // Fetch all necessary data in parallel for all sections
    const [
        allProfiles,
        { data: unassignedTx, error: unassignedTxError },
        { data: allTx, error: allTxError }
    ] = await Promise.all([
        getAllProfiles(),
        supabase.from('transactions').select('*').eq('status', 'unassigned'), // Fetch only truly unassigned transactions
        supabase.from('transactions').select('*').order('created_at', { ascending: false }) // All
    ]);

    // --- Render Unassigned Transactions ---
    const unassignedList = document.getElementById('unassigned-transactions-list');
    if (unassignedTxError) {
        unassignedList.innerHTML = '<p class="error">Could not load transactions.</p>';
    } else if (unassignedTx.length === 0) {
        unassignedList.innerHTML = '<p>No unassigned transactions.</p>';
    } else {
        const helpas = allProfiles.filter(p => p.role === 'helpa');
        const helpaOptions = helpas.map(h => `<option value="${h.id}">${h.first_name || h.email}</option>`).join('');

        unassignedList.innerHTML = unassignedTx.map(tx => `
            <div class="transaction-item-admin">
                <p>${tx.description} - $${tx.amount}</p>
                <div class="assignment-controls">
                    <select id="helpa-select-${tx.id}">
                        <option value="">Assign to...</option>
                        ${helpaOptions}
                    </select>
                    <button data-tx-id="${tx.id}">Assign</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to all "Assign" buttons
        unassignedList.querySelectorAll('button[data-tx-id]').forEach(button => {
            button.addEventListener('click', () => {
                const txId = button.dataset.txId;
                const helpaId = document.getElementById(`helpa-select-${txId}`).value;
                if (helpaId) {
                    assignTransaction(txId, helpaId);
                } else {
                    alert('Please select a Helpa to assign.');
                }
            });
        });
    }

    // --- Render All Transactions ---
    const allTransactionsList = document.getElementById('all-transactions-list');
    if (allTxError) {
        allTransactionsList.innerHTML = '<p class="error">Could not load transaction history.</p>';
        return; // Stop if we can't load the main data
    } else if (allTx.length === 0) {
        allTransactionsList.innerHTML = '<p>There are no transactions in the system yet.</p>';
    }

    // Populate status filter dropdown
    const statuses = [...new Set(allTx.map(tx => tx.status))];
    statusFilter.innerHTML = '<option value="">Filter by status...</option>' + statuses.map(s => `<option value="${s}">${s}</option>`).join('');

    const profileMap = new Map(allProfiles.map(p => [p.id, p.first_name || p.email]));

    const renderAllTransactions = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value;

        const filteredTx = allTx.filter(tx => {
            const matchesSearch = tx.description.toLowerCase().includes(searchTerm);
            const matchesStatus = selectedStatus ? tx.status === selectedStatus : true;
            return matchesSearch && matchesStatus;
        });

        if (filteredTx.length === 0) {
            allTransactionsList.innerHTML = '<p>No transactions match your criteria.</p>';
            return;
        }

        allTransactionsList.innerHTML = `
        <table class="transactions-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Customer</th>
                    <th>Helpa</th>
                    <th>Status</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${filteredTx.map(tx => `
                    <tr>
                        <td>${tx.description}</td>
                        <td>${profileMap.get(tx.user_id) || 'N/A'}</td>
                        <td>${profileMap.get(tx.helpa_id) || 'Unassigned'}</td>
                        <td><strong>${tx.status}</strong></td>
                        <td>$${tx.amount || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    };

    // Initial render
    renderAllTransactions();

    // Add event listeners for filtering
    searchInput.addEventListener('input', renderAllTransactions);
    statusFilter.addEventListener('change', renderAllTransactions);

    // --- Render User Management ---
    const userManagementList = document.getElementById('user-management-list');
    if (!allProfiles) {
        userManagementList.innerHTML = '<p class="error">Could not load users.</p>';
    } else {
        userManagementList.innerHTML = `
            <table class="user-management-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Current Role</th>
                        <th>Change Role</th>
                    </tr>
                </thead>
                <tbody>
                    ${allProfiles.map(profile => `
                        <tr>
                            <td>${profile.first_name || profile.email}</td>
                            <td><strong>${profile.role}</strong></td>
                            <td>
                                <select id="role-select-${profile.id}" ${profile.id === adminUser.id ? 'disabled' : ''}>
                                    <option value="customer" ${profile.role === 'customer' ? 'selected' : ''}>Customer</option>
                                    <option value="helpa" ${profile.role === 'helpa' ? 'selected' : ''}>Helpa</option>
                                    <option value="admin" ${profile.role === 'admin' ? 'selected' : ''}>Admin</option>
                                </select>
                                <button data-user-id="${profile.id}" ${profile.id === adminUser.id ? 'disabled' : ''}>Save</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        userManagementList.querySelectorAll('button[data-user-id]').forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.dataset.userId;
                const newRole = document.getElementById(`role-select-${userId}`).value;
                updateUserRole(userId, newRole);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', loadAdminDashboard);