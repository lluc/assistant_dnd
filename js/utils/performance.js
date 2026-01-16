/* Performance optimizations */

// Virtual scrolling for large lists
class VirtualScroller {
    constructor(container, itemHeight, renderItem) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;
        this.visibleItems = [];
        this.startIndex = 0;
        this.endIndex = 0;
        this.data = [];
        
        this.setupScrollListener();
    }

    setData(data) {
        this.data = data;
        this.updateVisibleItems();
    }

    setupScrollListener() {
        let scrollTimeout;
        this.container.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateVisibleItems();
            }, 16); // ~60fps
        });
    }

    updateVisibleItems() {
        const containerHeight = this.container.clientHeight;
        const scrollTop = this.container.scrollTop;
        
        this.startIndex = Math.floor(scrollTop / this.itemHeight);
        this.endIndex = Math.min(
            this.startIndex + Math.ceil(containerHeight / this.itemHeight) + 5,
            this.data.length
        );

        this.render();
    }

    render() {
        const fragment = document.createDocumentFragment();
        
        for (let i = this.startIndex; i < this.endIndex; i++) {
            const item = this.renderItem(this.data[i], i);
            item.style.position = 'absolute';
            item.style.top = `${i * this.itemHeight}px`;
            item.style.width = '100%';
            fragment.appendChild(item);
        }

        this.container.innerHTML = '';
        this.container.appendChild(fragment);
        this.container.style.height = `${this.data.length * this.itemHeight}px`;
    }
}

// Lazy loading for images
class LazyImageLoader {
    constructor() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (src) {
                        img.src = src;
                        img.classList.remove('lazy-loading');
                        img.classList.add('lazy-loaded');
                        this.imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
    }

    observe(img) {
        img.classList.add('lazy-loading');
        this.imageObserver.observe(img);
    }
}

// Debounce utility for search and scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle utility for high-frequency events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.observers = [];
    }

    startTiming(label) {
        this.metrics[label] = performance.now();
    }

    endTiming(label) {
        if (this.metrics[label]) {
            const duration = performance.now() - this.metrics[label];
            console.log(`${label}: ${duration.toFixed(2)}ms`);
            delete this.metrics[label];
            return duration;
        }
    }

    measureRender(componentName, renderFunction) {
        this.startTiming(`${componentName}-render`);
        const result = renderFunction();
        this.endTiming(`${componentName}-render`);
        return result;
    }

    observeElement(element, label) {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.entryType === 'measure' && entry.name.includes(label)) {
                    console.log(`${label} performance:`, entry);
                }
            });
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
        this.observers.push(observer);
    }

    disconnectAll() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// Memory leak detection
class MemoryManager {
    constructor() {
        this.componentRegistry = new Set();
        this.eventListeners = new Map();
    }

    registerComponent(component) {
        this.componentRegistry.add(component);
    }

    unregisterComponent(component) {
        this.componentRegistry.delete(component);
    }

    addEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        this.eventListeners.get(element).push({ event, handler, options });
    }

    removeEventListeners(element) {
        const listeners = this.eventListeners.get(element);
        if (listeners) {
            listeners.forEach(({ event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
            this.eventListeners.delete(element);
        }
    }

    cleanup() {
        this.componentRegistry.forEach(component => {
            if (component.remove) {
                component.remove();
            }
            this.removeEventListeners(component);
        });
        this.componentRegistry.clear();
        this.eventListeners.clear();
    }
}

// Service Worker registration for offline capability
class ServiceWorkerManager {
    constructor() {
        this.swRegistration = null;
    }

    async register() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', this.swRegistration);
                
                this.setupUpdateListener();
                return true;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
                return false;
            }
        }
        return false;
    }

    setupUpdateListener() {
        this.swRegistration.addEventListener('updatefound', () => {
            const newWorker = this.swRegistration.installing;
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.showUpdateNotification();
                }
            });
        });
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>Une nouvelle version est disponible!</span>
                <button onclick="this.reloadApp()">Mettre à jour</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-color);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-family: var(--font-secondary);
        `;
        
        notification.querySelector('button').onclick = () => {
            window.location.reload();
        };
        
        document.body.appendChild(notification);
    }

    reloadApp() {
        window.location.reload();
    }
}

// Responsive image handling
class ResponsiveImageManager {
    constructor() {
        this.breakpoints = {
            small: '480w',
            medium: '768w',
            large: '1024w',
            xlarge: '1200w'
        };
    }

    generateSrcSet(basePath, extension) {
        return Object.entries(this.breakpoints)
            .map(([size, width]) => `${basePath}-${size}.${extension} ${width}`)
            .join(', ');
    }

    generateSizes() {
        return `
            (max-width: 480px) 100vw,
            (max-width: 768px) 50vw,
            (max-width: 1024px) 33vw,
            25vw
        `;
    }
}

// Export utilities for use in components
export {
    VirtualScroller,
    LazyImageLoader,
    debounce,
    throttle,
    PerformanceMonitor,
    MemoryManager,
    ServiceWorkerManager,
    ResponsiveImageManager
};

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
    window.performanceMonitor = new PerformanceMonitor();
    window.memoryManager = new MemoryManager();
    
    // Log performance metrics
    window.addEventListener('load', () => {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
        }
    });
}