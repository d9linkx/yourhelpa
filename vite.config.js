import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        addProductService: resolve(__dirname, 'add-product-service.html'),
        blog: resolve(__dirname, 'blog.html'),
        blogPost: resolve(__dirname, 'blog-post.html'),
        businessSetup: resolve(__dirname, 'business-setup.html'),
        businessView: resolve(__dirname, 'business-view.html'),
        contact: resolve(__dirname, 'contact.html'),
        customerFaq: resolve(__dirname, 'customer-faq.html'),
        helpaDashboard: resolve(__dirname, 'helpa-dashboard.html'),
        helpaFaq: resolve(__dirname, 'helpa-faq.html'),
        helpaGuide: resolve(__dirname, 'helpa-guide.html'),
        howItWorks: resolve(__dirname, 'how-it-works.html'),
        jobDetails: resolve(__dirname, 'job-details.html'),
        login: resolve(__dirname, 'login.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        profile: resolve(__dirname, 'profile.html'),
        press: resolve(__dirname, 'press.html'),
        register: resolve(__dirname, 'register.html'),
        requestService: resolve(__dirname, 'request-service.html'),
        safety: resolve(__dirname, 'safety.html'),
        serviceDetail: resolve(__dirname, 'service-detail.html'),
        serviceEdit: resolve(__dirname, 'service-edit.html'),
        servicePreview: resolve(__dirname, 'service-preview.html'),
        services: resolve(__dirname, 'services.html'),
        servicesProducts: resolve(__dirname, 'services-products.html'),
        settings: resolve(__dirname, 'settings.html'),
        signup: resolve(__dirname, 'signup.html'),
        terms: resolve(__dirname, 'terms.html'),
        transactionDetail: resolve(__dirname, 'transaction-detail.html'),
      },
    },
  },
});