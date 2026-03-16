import { supabase } from './js/supabase-client.js';

// --- Helpers ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};

// --- Main Logic ---
async function initializeDashboard() {
    // 1. Securely check for an active Supabase user session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error getting session:', error.message);
        window.location.href = 'login.html';
        return;
    }

    if (!session) {
        // No active session, redirect to login
        window.location.href = 'login.html';
        return;
    }

    const user = session.user;
    
    // Load data
    loadDashboardData(user);

    // --- UI Interactions ---
    const availabilityButton = document.getElementById('availability-button');
    if (availabilityButton) {
        availabilityButton.addEventListener('click', () => {
            const isActive = availabilityButton.classList.toggle('active');
            const textSpan = availabilityButton.querySelector('span');
            if (textSpan) {
                textSpan.textContent = isActive ? 'Available' : 'Unavailable';
            }
            // TODO: Add API call to update user's availability status in Supabase
            console.log(`Availability set to: ${isActive ? 'Available' : 'Unavailable'}`);
        });
    }

    const snapshotContainer = document.getElementById('snapshot-stats-container');
    if (snapshotContainer) {
        snapshotContainer.addEventListener('click', (e) => {
            const clickedCard = e.target.closest('.mini-stat-card');
            if (!clickedCard) return;
            const isAlreadyActive = clickedCard.classList.contains('active');
            snapshotContainer.querySelectorAll('.mini-stat-card').forEach(card => card.classList.remove('active'));
            if (!isAlreadyActive) {
                clickedCard.classList.add('active');
            }
        });
    }

    const calendarWidget = document.getElementById('calendar-widget');
    if (calendarWidget) {
        let calendarHTML = '<div class="calendar-grid">';
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        days.forEach(day => calendarHTML += `<div class="calendar-header">${day}</div>`);
        const today = new Date().getDate();
        for (let i = 1; i <= 31; i++) {
            let dayClass = 'calendar-day';
            if (i === today) dayClass += ' today';
            if (i === today + 2 || i === today + 3) dayClass += ' booked';
            calendarHTML += `<div class="${dayClass}">${i}</div>`;
        }
        calendarHTML += '</div>';
        calendarWidget.innerHTML = calendarHTML;
    }
}

async function loadDashboardData(user) {
    // --- Render Welcome Message ---
    renderWelcomeMessage(user);

    // --- Fetch and Render Data Concurrently ---
    // This is more efficient than fetching one by one
    await fetchAndRenderBusinesses(user.id).catch(error => {
        console.error("An error occurred while loading dashboard data:", error);
    });
    
    // We will implement stats fetching in a later step
    fetchAndRenderStats(user.id);
}

function renderWelcomeMessage(user) {
    const welcomeMessage = document.getElementById('welcome-message');
    if (user && user.user_metadata && user.user_metadata.full_name) {
        const firstName = user.user_metadata.full_name.split(' ')[0];
        welcomeMessage.innerHTML = `Welcome back, <span class="h1-underline">${firstName}</span>`;
    } else if (user) {
        welcomeMessage.innerHTML = `Welcome back, <span class="h1-underline">Helpa</span>`;
    }
}

// Global state for stats to allow filtering without re-fetching
let allJobsData = [];
let allStatsData = [];

async function fetchAndRenderStats(userId) {
    // TODO: Implement stats fetching from Supabase transactions table
    console.log("Stats fetching is not yet implemented with Supabase.");
    // Set default values to avoid errors
    if (document.getElementById('ongoing-jobs-value')) {
        document.getElementById('ongoing-jobs-value').textContent = '0';
        document.getElementById('completed-jobs-value').textContent = '0';
        document.getElementById('profile-views-value').textContent = '0';
        document.getElementById('new-leads-value').textContent = '0';
        document.getElementById('recurring-customers-value').textContent = '0';
    }
}

async function populateStatsFilters(userId) {
    // TODO: Implement filter population from Supabase
}

function renderStatsCalculations(initialProfileViews = 0) {
    const period = document.getElementById('stats-period').value;
    const businessId = document.getElementById('stats-business').value;
    const serviceId = document.getElementById('stats-service').value;

    let filteredJobs = allJobsData;
    let filteredStats = allStatsData;

    // Filter by Period
    const now = new Date();
    if (period !== 'all') {
        filteredJobs = filteredJobs.filter(j => {
            const d = new Date(j.created_at);
            if (period === 'today') {
                return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            } else if (period === 'week') {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return d >= oneWeekAgo;
            } else if (period === 'month') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            return true;
        });

        // Filter Stats Table by Period
        filteredStats = filteredStats.filter(s => {
            const d = new Date(s.month);
            if (period === 'today') return false; // Monthly stats don't track daily
            if (period === 'week') return false; // Monthly stats don't track weekly
            if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            return true;
        });
    }

    // Filter by Business
    if (businessId !== 'all') {
        filteredJobs = filteredJobs.filter(j => j.business_id === businessId);
        filteredStats = filteredStats.filter(s => s.business_id === businessId);
    }

    // Filter by Service
    if (serviceId !== 'all') {
        filteredJobs = filteredJobs.filter(j => j.service_id === serviceId);
        filteredStats = filteredStats.filter(s => s.service_id === serviceId);
    }

    // --- Calculate Stats ---
    const ongoingJobs = filteredJobs.filter(j => j.status === 'ongoing' || j.status === 'in_progress').length;
    const completedJobs = filteredJobs.filter(j => j.status === 'completed').length;

    // Recurring Customers
    const completedJobsByClient = filteredJobs
        .filter(j => j.status === 'completed' && j.client_id)
        .reduce((acc, job) => {
            acc[job.client_id] = (acc[job.client_id] || 0) + 1;
            return acc;
        }, {});
    const recurringCustomers = Object.values(completedJobsByClient).filter(count => count > 1).length;

    // Calculate New Leads from the stats table
    const newLeads = filteredStats.reduce((sum, item) => sum + (item.new_leads || 0), 0);

    // Calculate Profile Views from the stats table to respect filters
    // If filtering, use stats table. If not, use the total from profile (passed as initialProfileViews if available)
    let profileViews = filteredStats.reduce((sum, item) => sum + (item.profile_views || 0), 0);
    if (period === 'all' && businessId === 'all' && serviceId === 'all' && initialProfileViews > 0) {
        profileViews = initialProfileViews;
    }

    // Update UI
    document.getElementById('ongoing-jobs-value').textContent = ongoingJobs;
    document.getElementById('completed-jobs-value').textContent = completedJobs;
    document.getElementById('profile-views-value').textContent = profileViews;
    document.getElementById('new-leads-value').textContent = newLeads;
    document.getElementById('recurring-customers-value').textContent = recurringCustomers;
}

async function fetchAndRenderBusinesses(userId) {
    const container = document.getElementById('businesses-list-container');
    try {
        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('id, name, category')
            .eq('helpa_id', userId);

        if (error) throw error;

        container.innerHTML = ''; // Clear loading message
        if (!businesses || businesses.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 1rem; border: none;">
                    <div class="icon-bg" style="margin: 0 auto 1rem; background-color: rgba(14, 165, 233, 0.1); color: var(--primary-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l18 0"></path><path d="M5 21l0 -14l8 -4l8 4l0 14"></path><path d="M9 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path></svg>
                    </div>
                    <p style="margin-bottom: 1rem;">Create a business profile to start adding products and services.</p>
                    <a href="business-setup.html" class="button-primary">Set Up Business</a>
                </div>`;
        } else {
            const list = document.createElement('div');
            list.className = 'business-list';
            businesses.forEach(biz => {
                const bizHTML = `
                    <div class="business-card">
                        <div class="business-header-row">
                            <div class="business-icon-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l18 0"></path><path d="M5 21l0 -14l8 -4l8 4l0 14"></path><path d="M9 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path></svg>
                            </div>
                            <div class="business-details">
                                <h3>${biz.name}</h3>
                                <p>${biz.category || 'Service Business'}</p>
                            </div>
                        </div>
                        <div class="business-actions">
                            <a href="add-product-service.html?business_id=${biz.id}" class="button-primary button-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add Service
                            </a>
                            <a href="business-setup.html?id=${biz.id}" class="button-outline button-sm">
                                Manage
                            </a>
                        </div>
                    </div>`;
                list.insertAdjacentHTML('beforeend', bizHTML);
            });
            container.appendChild(list);
        }
    } catch (error) {
        console.error('Error fetching businesses:', error.message);
        container.innerHTML = '<p class="error-text">Could not load your businesses.</p>';
    }
}

// Run the initialization logic when the DOM is ready.
document.addEventListener('DOMContentLoaded', initializeDashboard);