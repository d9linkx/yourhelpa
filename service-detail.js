import { supabase } from './js/supabase-client.js';

function getServiceId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadServiceDetails() {
    const serviceId = getServiceId();
    const contentArea = document.getElementById('service-detail-content');

    if (!serviceId) {
        contentArea.innerHTML = '<h1>Service Not Found</h1><p>No service ID was provided. Please go back to the <a href="services.html">services page</a> and select one.</p>';
        return;
    }

    const { data: service, error } = await supabase
        .from('services')
        .select(`
            *,
            profiles ( first_name, email )
        `)
        .eq('id', serviceId)
        .single();

    if (error || !service) {
        console.error('Error fetching service details:', error);
        contentArea.innerHTML = '<h1>Error</h1><p>Could not load the service details. It may have been removed.</p>';
        return;
    }

    const imageGallery = service.images && service.images.length > 0
        ? service.images.map(img => `<img src="${img}" alt="${service.title}" class="service-image">`).join('')
        : `<img src="https://placehold.co/800x400?text=No+Image" alt="${service.title}" class="service-image">`;

    contentArea.innerHTML = `
        <div class="service-detail-layout">
            <div class="service-gallery">
                ${imageGallery}
            </div>
            <div class="service-info">
                <h1>${service.title}</h1>
                <p class="service-provider">Offered by: <strong>${service.profiles?.first_name || 'A Helpa'}</strong></p>
                <p class="service-price">$${service.price} ${service.price_type === 'hourly' ? '/ hour' : 'fixed price'}</p>
                
                <h2>Description</h2>
                <p>${service.description.replace(/\n/g, '<br>')}</p>

                <a href="request-service.html" class="button-primary large">Request This Service</a>
                <p class="small-text">You will be asked to log in or sign up to complete your request.</p>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', loadServiceDetails);