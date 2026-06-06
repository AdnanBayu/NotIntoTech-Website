// Articles Tableau Lazy Loading & Dynamic Embedding
(function () {
    let tableauScriptLoaded = false;

    /**
     * Load the Tableau Embedding API script dynamically
     */
    function loadTableauScript(callback) {
        if (tableauScriptLoaded) {
            if (callback) callback();
            return;
        }

        tableauScriptLoaded = true;

        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js';

        script.onload = () => {
            console.log('Tableau script loaded successfully');
            if (callback) callback();
        };

        script.onerror = () => {
            console.error('Failed to load Tableau embedding script');
            tableauScriptLoaded = false;
        };

        document.body.appendChild(script);
    }

    /**
     * Parse & render visible Tableau visualizations
     */
    function parseTableauVizs() {
        // Move data-src to src so Tableau can embed
        document.querySelectorAll('tableau-viz.visible-for-tableau:not([src])').forEach(viz => {
            const dataSrc = viz.getAttribute('data-src');
            if (dataSrc) {
                viz.setAttribute('src', dataSrc);
            }
        });

        // Trigger Tableau parsing if library is ready
        if (window.tableau && window.tableau.Embedding) {
            window.tableau.Embedding.parse();
        } else {
            console.warn('Tableau Embedding API not ready');
        }
    }

    /**
     * Watch for tableau-viz elements entering viewport
     */
    function initTableauObserver() {
        const tableauVizs = document.querySelectorAll('tableau-viz[data-src]');

        if (!tableauVizs.length) return;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !entry.target.classList.contains('visible-for-tableau')) {
                            entry.target.classList.add('visible-for-tableau');

                            // Load Tableau script and parse
                            loadTableauScript(() => {
                                parseTableauVizs();
                            });

                            observer.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: '200px' }
            );

            tableauVizs.forEach(viz => {
                observer.observe(viz);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            tableauVizs.forEach(viz => {
                viz.classList.add('visible-for-tableau');
            });
            loadTableauScript(() => {
                parseTableauVizs();
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTableauObserver);
    } else {
        initTableauObserver();
    }
})();