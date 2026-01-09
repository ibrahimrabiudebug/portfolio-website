// =============================================
// Portfolio.js - Enhanced Professional Version
// =============================================

// ====================
// Constants & Config
// ====================
const CONFIG = {
    // Performance settings
    DEBOUNCE_DELAY: 100,
    THROTTLE_DELAY: 200,
    
    // Animation settings
    ANIMATION_DURATION: 300,
    SCROLL_OFFSET: 100,
    
    // API endpoints (for future expansion)
    API_BASE_URL: 'https://api.ibrahimrabiu.dev',
    
    // Feature flags
    ENABLE_ANALYTICS: true,
    ENABLE_OFFLINE_SUPPORT: true,
    
    // UI settings
    THEME_KEY: 'portfolio_theme',
    VISITED_KEY: 'portfolio_visited',
    LAST_VISIT_KEY: 'portfolio_last_visit'
};

// ====================
// State Management
// ====================
const AppState = {
    currentTheme: 'light',
    isMobileMenuOpen: false,
    isScrolling: false,
    lastScrollY: 0,
    scrollDirection: 'down',
    activeSection: 'home',
    isOnline: navigator.onLine,
    pageLoadTime: null,
    userPreferences: {}
};

// ====================
// Performance Utilities
// ====================
const Performance = {
    startTime: null,
    
    startMeasure() {
        this.startTime = performance.now();
        console.time('PageLoad');
    },
    
    endMeasure() {
        if (this.startTime) {
            const loadTime = performance.now() - this.startTime;
            console.timeEnd('PageLoad');
            console.log(`🕒 Total load time: ${loadTime.toFixed(2)}ms`);
            
            // Send to analytics if enabled
            if (CONFIG.ENABLE_ANALYTICS) {
                this.trackPerformance(loadTime);
            }
        }
    },
    
    trackPerformance(loadTime) {
        // In a real app, send to analytics service
        const metrics = {
            loadTime,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Store locally for potential sync later
        this.storeMetric('performance', metrics);
    },
    
    storeMetric(key, data) {
        const stored = JSON.parse(localStorage.getItem('portfolio_metrics') || '[]');
        stored.push({ key, data, timestamp: Date.now() });
        localStorage.setItem('portfolio_metrics', JSON.stringify(stored.slice(-50))); // Keep last 50 entries
    }
};

// ====================
// DOM Utilities
// ====================
const DOM = {
    // Debounce function for resize/scroll events
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for scroll/resize events
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Smooth scroll to element
    scrollToElement(element, offset = 0) {
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },
    
    // Check if element is in viewport
    isInViewport(element, offset = 0) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight - offset) &&
            rect.bottom >= offset
        );
    },
    
    // Get current scroll position
    getScrollPosition() {
        return window.pageYOffset || document.documentElement.scrollTop;
    },
    
    // Add class with animation
    addClassWithAnimation(element, className) {
        if (!element || !className) return;
        
        element.classList.add(className);
        return new Promise(resolve => {
            setTimeout(resolve, CONFIG.ANIMATION_DURATION);
        });
    },
    
    // Remove class with animation
    removeClassWithAnimation(element, className) {
        if (!element || !className) return;
        
        element.classList.remove(className);
        return new Promise(resolve => {
            setTimeout(resolve, CONFIG.ANIMATION_DURATION);
        });
    }
};

// ====================
// Animation Manager
// ====================
const AnimationManager = {
    observers: [],
    
    init() {
        // Initialize intersection observers for scroll animations
        this.setupIntersectionObservers();
        this.setupScrollAnimations();
    },
    
    setupIntersectionObservers() {
        // Animate elements when they enter viewport
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateOnScroll(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe all elements with data-animate attribute
        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });
        
        this.observers.push(observer);
    },
    
    setupScrollAnimations() {
        // Parallax effect for hero section
        window.addEventListener('scroll', DOM.throttle(() => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-parallax-speed') || 0.5);
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        }, CONFIG.THROTTLE_DELAY));
    },
    
    animateOnScroll(element) {
        const animationType = element.getAttribute('data-animate');
        
        switch (animationType) {
            case 'fade-up':
                element.classList.add('animate-fade-up');
                break;
            case 'fade-in':
                element.classList.add('animate-fade-in');
                break;
            case 'slide-left':
                element.classList.add('animate-slide-left');
                break;
            case 'slide-right':
                element.classList.add('animate-slide-right');
                break;
            default:
                element.classList.add('animate-fade-in');
        }
    },
    
    // Cleanup observers
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
};

// ====================
// Theme Manager
// ====================
const ThemeManager = {
    init() {
        this.loadTheme();
        this.setupThemeToggle();
        this.setupSystemThemeListener();
    },
    
    loadTheme() {
        const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else if (systemPrefersDark) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }
    },
    
    setTheme(theme) {
        AppState.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(CONFIG.THEME_KEY, theme);
        
        // Dispatch custom event for theme change
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    },
    
    toggleTheme() {
        const newTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Animate theme transition
        this.animateThemeTransition();
    },
    
    animateThemeTransition() {
        const style = document.createElement('style');
        style.innerHTML = `
            * {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            document.head.removeChild(style);
        }, 300);
    },
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    },
    
    setupSystemThemeListener() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(CONFIG.THEME_KEY)) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
};

// ====================
// Navigation Manager
// ====================
const NavigationManager = {
    init() {
        this.setupSmoothScroll();
        this.setupMobileNavigation();
        this.setupActiveSectionTracker();
        this.setupBackToTopButton();
    },
    
    setupSmoothScroll() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    DOM.scrollToElement(targetElement, 80);
                    
                    // Close mobile menu if open
                    if (AppState.isMobileMenuOpen) {
                        this.toggleMobileMenu();
                    }
                }
            });
        });
    },
    
    setupMobileNavigation() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (AppState.isMobileMenuOpen && 
                    !mobileMenu.contains(e.target) && 
                    !mobileMenuBtn.contains(e.target)) {
                    this.toggleMobileMenu();
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && AppState.isMobileMenuOpen) {
                    this.toggleMobileMenu();
                }
            });
        }
    },
    
    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        if (!mobileMenu || !mobileMenuBtn) return;
        
        AppState.isMobileMenuOpen = !AppState.isMobileMenuOpen;
        
        if (AppState.isMobileMenuOpen) {
            mobileMenu.classList.add('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = '';
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('mobilemenutoggle', { 
            detail: { isOpen: AppState.isMobileMenuOpen } 
        }));
    },
    
    setupActiveSectionTracker() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const updateActiveSection = () => {
            let currentSection = '';
            const scrollPosition = DOM.getScrollPosition() + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });
            
            if (currentSection !== AppState.activeSection) {
                AppState.activeSection = currentSection;
                
                // Update nav links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSection}`) {
                        link.classList.add('active');
                    }
                });
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('activesectionchange', { 
                    detail: { section: currentSection } 
                }));
            }
        };
        
        window.addEventListener('scroll', DOM.throttle(updateActiveSection, 100));
    },
    
    setupBackToTopButton() {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'back-to-top';
        backToTopBtn.className = 'back-to-top-btn';
        backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTopBtn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(backToTopBtn);
        
        // Show/hide button based on scroll position
        const toggleBackToTop = () => {
            if (DOM.getScrollPosition() > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        };
        
        window.addEventListener('scroll', DOM.throttle(toggleBackToTop, 100));
        
        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
};

// ====================
// Form Handler
// ====================
const FormHandler = {
    init() {
        this.setupFormValidation();
        this.setupFormSubmission();
    },
    
    setupFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                // Real-time validation
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
                
                // Prevent form submission on enter in textarea
                if (input.tagName === 'TEXTAREA') {
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                            form.dispatchEvent(new Event('submit'));
                        }
                    });
                }
            });
            
            // Form submission validation
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    this.showFormError(form, 'Please fix the errors before submitting.');
                }
            });
        });
    },
    
    validateField(field) {
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // URL validation
        if (field.type === 'url' && field.value.trim()) {
            try {
                new URL(field.value);
            } catch {
                isValid = false;
                errorMessage = 'Please enter a valid URL';
            }
        }
        
        // Min length validation
        if (field.hasAttribute('minlength') && field.value.length < parseInt(field.getAttribute('minlength'))) {
            isValid = false;
            errorMessage = `Minimum ${field.getAttribute('minlength')} characters required`;
        }
        
        // Max length validation
        if (field.hasAttribute('maxlength') && field.value.length > parseInt(field.getAttribute('maxlength'))) {
            isValid = false;
            errorMessage = `Maximum ${field.getAttribute('maxlength')} characters allowed`;
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }
        
        return isValid;
    },
    
    validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        field.classList.add('error');
        field.parentNode.appendChild(errorElement);
        
        // Focus on first error field
        if (!field.hasAttribute('data-focused')) {
            field.focus();
            field.setAttribute('data-focused', 'true');
        }
    },
    
    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.removeAttribute('data-focused');
    },
    
    showFormError(form, message) {
        let formError = form.querySelector('.form-error');
        
        if (!formError) {
            formError = document.createElement('div');
            formError.className = 'form-error';
            formError.setAttribute('role', 'alert');
            form.insertBefore(formError, form.firstChild);
        }
        
        formError.textContent = message;
        formError.classList.add('visible');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            formError.classList.remove('visible');
        }, 5000);
    },
    
    setupFormSubmission() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.validateForm(contactForm)) return;
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            try {
                // Show loading state
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                // Simulate API call (replace with actual API call)
                await this.simulateApiCall(contactForm);
                
                // Show success message
                this.showSuccessMessage(contactForm, 'Message sent successfully! I\'ll get back to you soon.');
                contactForm.reset();
                
            } catch (error) {
                // Show error message
                this.showFormError(contactForm, 'Failed to send message. Please try again later.');
                console.error('Form submission error:', error);
                
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    },
    
    async simulateApiCall(form) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, you would:
        // 1. Collect form data
        // 2. Send to your backend API
        // 3. Handle the response
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Store form data locally (for demo purposes)
        const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
        submissions.push({
            ...data,
            timestamp: new Date().toISOString(),
            ip: await this.getClientIP()
        });
        localStorage.setItem('form_submissions', JSON.stringify(submissions));
        
        // Return success
        return { success: true };
    },
    
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    },
    
    showSuccessMessage(form, message) {
        const successElement = document.createElement('div');
        successElement.className = 'form-success';
        successElement.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        successElement.setAttribute('role', 'alert');
        
        form.insertBefore(successElement, form.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            successElement.remove();
        }, 5000);
    }
};

// ====================
// Analytics & Tracking
// ====================
const Analytics = {
    init() {
        if (!CONFIG.ENABLE_ANALYTICS) return;
        
        this.trackPageView();
        this.trackUserEngagement();
        this.setupEventTracking();
        this.trackReturnVisits();
    },
    
    trackPageView() {
        const pageData = {
            url: window.location.href,
            referrer: document.referrer || 'direct',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };
        
        this.sendToAnalytics('pageview', pageData);
    },
    
    trackUserEngagement() {
        // Track time on page
        let startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - startTime;
            this.sendToAnalytics('time_spent', { duration: timeSpent });
        });
        
        // Track scroll depth
        let maxScrollDepth = 0;
        
        window.addEventListener('scroll', DOM.throttle(() => {
            const scrollDepth = (DOM.getScrollPosition() + window.innerHeight) / document.documentElement.scrollHeight;
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                this.sendToAnalytics('scroll_depth', { depth: maxScrollDepth });
            }
        }, 1000));
    },
    
    setupEventTracking() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Track project clicks
            if (target.closest('.project-card, .project-link')) {
                const projectTitle = target.closest('.project-card')?.querySelector('h3')?.textContent || 'Unknown';
                this.sendToAnalytics('project_click', { project: projectTitle });
            }
            
            // Track social link clicks
            if (target.closest('.social-link')) {
                const platform = target.closest('.social-link').getAttribute('aria-label') || 'unknown';
                this.sendToAnalytics('social_click', { platform });
            }
            
            // Track download clicks
            if (target.hasAttribute('download')) {
                const fileName = target.getAttribute('download') || 'unknown';
                this.sendToAnalytics('download', { file: fileName });
            }
        });
    },
    
    trackReturnVisits() {
        const lastVisit = localStorage.getItem(CONFIG.LAST_VISIT_KEY);
        const currentVisit = new Date().toISOString();
        
        if (lastVisit) {
            const daysSinceLastVisit = Math.floor(
                (new Date(currentVisit) - new Date(lastVisit)) / (1000 * 60 * 60 * 24)
            );
            
            this.sendToAnalytics('return_visit', { daysSinceLastVisit });
        }
        
        localStorage.setItem(CONFIG.LAST_VISIT_KEY, currentVisit);
        localStorage.setItem(CONFIG.VISITED_KEY, 'true');
    },
    
    sendToAnalytics(event, data) {
        const analyticsData = {
            event,
            data,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        };
        
        // In production, send to your analytics service
        // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(analyticsData) });
        
        // For now, log to console and store locally
        console.log(`📊 Analytics: ${event}`, analyticsData);
        this.storeAnalyticsData(analyticsData);
    },
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('portfolio_session_id');
        
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('portfolio_session_id', sessionId);
        }
        
        return sessionId;
    },
    
    storeAnalyticsData(data) {
        const stored = JSON.parse(localStorage.getItem('portfolio_analytics') || '[]');
        stored.push(data);
        localStorage.setItem('portfolio_analytics', JSON.stringify(stored.slice(-100))); // Keep last 100 entries
    }
};

// ====================
// Performance Monitor
// ====================
const PerformanceMonitor = {
    init() {
        this.monitorCLS();
        this.monitorLCP();
        this.monitorFID();
        this.setupResourceTiming();
    },
    
    monitorCLS() {
        // Monitor Cumulative Layout Shift
        let clsValue = 0;
        let clsEntries = [];
        
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsEntries.push(entry);
                    clsValue += entry.value;
                }
            }
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // Report CLS on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                observer.disconnect();
                console.log(`📐 CLS: ${clsValue.toFixed(4)}`);
            }
        });
    },
    
    monitorLCP() {
        // Monitor Largest Contentful Paint
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            console.log(`🎨 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
        });
        
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
    },
    
    monitorFID() {
        // Monitor First Input Delay
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                const delay = entry.processingStart - entry.startTime;
                console.log(`⚡ FID: ${delay.toFixed(2)}ms`);
            }
        });
        
        observer.observe({ type: 'first-input', buffered: true });
    },
    
    setupResourceTiming() {
        // Monitor resource loading performance
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            
            resources.forEach(resource => {
                if (resource.initiatorType === 'script' || resource.initiatorType === 'css') {
                    console.log(`📦 ${resource.initiatorType}: ${resource.name} - ${resource.duration.toFixed(2)}ms`);
                }
            });
        });
    }
};

// ====================
// Offline Support
// ====================
const OfflineSupport = {
    init() {
        if (!CONFIG.ENABLE_OFFLINE_SUPPORT) return;
        
        this.setupServiceWorker();
        this.setupOfflineDetection();
        this.setupCacheManagement();
    },
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                        console.log('✅ ServiceWorker registered:', registration.scope);
                    },
                    (error) => {
                        console.log('❌ ServiceWorker registration failed:', error);
                    }
                );
            });
        }
    },
    
    setupOfflineDetection() {
        // Update online status
        const updateOnlineStatus = () => {
            AppState.isOnline = navigator.onLine;
            
            if (AppState.isOnline) {
                document.documentElement.classList.remove('offline');
                document.documentElement.classList.add('online');
                console.log('🌐 Online');
            } else {
                document.documentElement.classList.remove('online');
                document.documentElement.classList.add('offline');
                console.log('📴 Offline');
                
                // Show offline notification
                this.showOfflineNotification();
            }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus(); // Initial check
    },
    
    showOfflineNotification() {
        // Create offline notification
        const notification = document.createElement('div');
        notification.id = 'offline-notification';
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <i class="fas fa-wifi-slash"></i>
            <span>You are currently offline. Some features may be limited.</span>
            <button class="dismiss-btn" aria-label="Dismiss">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Add dismiss functionality
        notification.querySelector('.dismiss-btn').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-dismiss when back online
        window.addEventListener('online', () => {
            notification.remove();
        }, { once: true });
    },
    
    setupCacheManagement() {
        // Clear old caches on load
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    // Delete old caches (optional: implement cache versioning)
                    if (cacheName.startsWith('portfolio-') && !cacheName.includes('v1')) {
                        caches.delete(cacheName);
                    }
                });
            });
        }
    }
};

// ====================
// Main Initialization
// ====================
class PortfolioApp {
    constructor() {
        this.modules = [
            Performance,
            AnimationManager,
            ThemeManager,
            NavigationManager,
            FormHandler,
            Analytics,
            PerformanceMonitor,
            OfflineSupport
        ];
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Portfolio Application...');
            
            // Start performance measurement
            Performance.startMeasure();
            
            // Set page load time
            AppState.pageLoadTime = new Date().toISOString();
            
            // Initialize all modules
            this.modules.forEach(module => {
                if (typeof module.init === 'function') {
                    module.init();
                    console.log(`✅ ${module.constructor.name || 'Module'} initialized`);
                }
            });
            
            // Add CSS for dynamic elements
            this.injectDynamicStyles();
            
            // Set up global error handling
            this.setupErrorHandling();
            
            // Log successful initialization
            console.log('🎉 Portfolio Application initialized successfully!');
            console.log('👤 Welcome to Ibrahim Rabiu\'s Portfolio');
            console.log('📱 For the best experience, ensure JavaScript is enabled');
            
            // End performance measurement
            window.addEventListener('load', () => {
                setTimeout(() => Performance.endMeasure(), 100);
            });
            
            // Dispatch custom event for app readiness
            window.dispatchEvent(new CustomEvent('appready'));
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.handleInitError(error);
        }
    }
    
    injectDynamicStyles() {
        const styles = `
            /* Dynamic styles for JavaScript-enhanced features */
            .back-to-top-btn {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 50px;
                height: 50px;
                background: var(--primary-color, #2563eb);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }
            
            .back-to-top-btn.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .back-to-top-btn:hover {
                background: var(--primary-dark, #1d4ed8);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
            }
            
            .field-error {
                color: var(--accent-error, #ef4444);
                font-size: 0.875rem;
                margin-top: 0.25rem;
                animation: slideDown 0.3s ease;
            }
            
            .form-error, .form-success {
                padding: 1rem;
                border-radius: 0.5rem;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                animation: slideDown 0.3s ease;
            }
            
            .form-error {
                background: #fee2e2;
                color: #991b1b;
                border: 1px solid #fca5a5;
            }
            
            .form-success {
                background: #d1fae5;
                color: #065f46;
                border: 1px solid #6ee7b7;
            }
            
            input.error, textarea.error, select.error {
                border-color: var(--accent-error, #ef4444) !important;
            }
            
            .offline-notification {
                position: fixed;
                bottom: 1rem;
                left: 50%;
                transform: translateX(-50%);
                background: #fef3c7;
                color: #92400e;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 2000;
                animation: slideUp 0.3s ease;
            }
            
            .offline-notification .dismiss-btn {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0.25rem;
                margin-left: auto;
            }
            
            /* Animation keyframes */
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translate(-50%, 20px);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }
            
            /* Scroll animations */
            [data-animate] {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .animate-fade-up {
                opacity: 1;
                transform: translateY(0);
            }
            
            .animate-fade-in {
                opacity: 1;
            }
            
            .animate-slide-left {
                opacity: 1;
                transform: translateX(0);
            }
            
            .animate-slide-right {
                opacity: 1;
                transform: translateX(0);
            }
            
            /* Theme-specific styles */
            [data-theme="dark"] {
                color-scheme: dark;
            }
            
            [data-theme="light"] {
                color-scheme: light;
            }
            
            /* Print styles */
            @media print {
                .back-to-top-btn,
                .offline-notification {
                    display: none !important;
                }
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
    
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('🚨 Global error:', event.error);
            
            // Send to error tracking service
            this.trackError(event.error);
            
            // Show user-friendly error message (optional)
            if (!event.error.message.includes('ResizeObserver')) { // Ignore common benign errors
                this.showErrorMessage('An unexpected error occurred. Please refresh the page.');
            }
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 Unhandled promise rejection:', event.reason);
            this.trackError(event.reason);
        });
    }
    
    trackError(error) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Send to error tracking service
        console.error('📝 Error logged:', errorData);
        
        // Store locally for debugging
        const errors = JSON.parse(localStorage.getItem('portfolio_errors') || '[]');
        errors.push(errorData);
        localStorage.setItem('portfolio_errors', JSON.stringify(errors.slice(-20))); // Keep last 20 errors
    }
    
    showErrorMessage(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: #fecaca;
            color: #991b1b;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 3000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
    
    handleInitError(error) {
        // Fallback basic functionality if initialization fails
        console.warn('⚠️ Falling back to basic functionality');
        
        // Ensure navigation still works
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Show error message to user
        this.showErrorMessage('Some features may not work properly. Please refresh the page.');
    }
    
    // Cleanup method for single-page applications
    destroy() {
        // Cleanup all modules
        this.modules.forEach(module => {
            if (typeof module.cleanup === 'function') {
                module.cleanup();
            }
        });
        
        // Remove event listeners
        window.removeEventListener('error', this.handleError);
        window.removeEventListener('unhandledrejection', this.handleRejection);
        
        console.log('🧹 Portfolio Application cleaned up');
    }
}

// ====================
// Application Bootstrap
// ====================

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    
    // Make app globally available for debugging
    window.PortfolioApp = app;
    
    // Initialize app
    app.init();
    
    // Provide global utility functions
    window.util = {
        scrollTo: (selector) => DOM.scrollToElement(document.querySelector(selector)),
        setTheme: (theme) => ThemeManager.setTheme(theme),
        toggleTheme: () => ThemeManager.toggleTheme(),
        getAppState: () => ({ ...AppState }),
        trackEvent: (event, data) => Analytics.sendToAnalytics(event, data)
    };
    
    // Development helpers
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Development mode enabled');
        console.log('🛠️ Available utilities:', Object.keys(window.util));
    }
});

// ====================
// Progressive Enhancement
// ====================

// Ensure basic functionality works without JavaScript
document.documentElement.classList.add('js-enabled');

// Add no-js fallback
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.remove('no-js');
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PortfolioApp,
        AppState,
        DOM,
        Performance,
        Analytics
    };
}