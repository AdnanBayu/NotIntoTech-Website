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

// REMINDER: CONSIDER REMOVE THIS
// Insights Page Client-Side Fetch
document.addEventListener("DOMContentLoaded", () => {
    const articlesContainer = document.getElementById('articles-container');
    if (!articlesContainer) return;
    const paginationContainer = document.getElementById('pagination-container');
    const noArticlesMessage = document.getElementById('no-articles-message');
    const loadingSpinner = document.getElementById('loading-spinner');

    async function fetchInsights(page = 1) {
        loadingSpinner.classList.remove('hidden');
        articlesContainer.innerHTML = '';
        paginationContainer.innerHTML = '';
        noArticlesMessage.classList.add('hidden');

        try {
            const response = await fetch(`/api/insights?page=${page}&limit=9`);
            const json = await response.json();

            if (json.success) {
                renderArticles(json.data);
                renderPagination(json.pagination);
                if (json.data.length === 0) {
                    noArticlesMessage.classList.remove('hidden');
                }
            } else {
                console.error("Failed to fetch articles:", json.error);
                noArticlesMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Error calling API:", error);
            noArticlesMessage.classList.remove('hidden');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    }

    function renderArticles(articles) {
        let html = '';
        articles.forEach(article => {
            const dateStr = new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            const excerpt = article.excerpt || (article.content ? article.content.substring(0, 150) : '');

            html += `
                    <a href="/insights/${article.slug}" class="group block">
                        <div class="bg-[#010C13] bg-opacity-5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-opacity-100 hover:scale-110 hover:border-[#8EF0DD] transition-all duration-300 h-full flex flex-col p-6 border border-white border-opacity-10">
                            <!-- Title -->
                            <h2 class="text-white text-xl font-bold mb-3 line-clamp-2 group-hover:text-[#8EF0DD] transition-colors">
                                ${article.title}
                            </h2>

                            <!-- Category -->
                            <div class="mb-4">
                                <span class="inline-block bg-[#8EF0DD] text-[#154D41] text-xs font-semibold px-3 py-1 rounded-full">
                                    ${article.category || 'Article'}
                                </span>
                            </div>

                            <!-- Sinopsis -->
                            <p class="text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                                ${excerpt}...
                            </p>

                            <!-- Meta Info -->
                            <div class="flex justify-between text-xs text-gray-400 pt-4 border-t border-white border-opacity-10">
                                <span>
                                    ${dateStr}
                                </span>
                                <span>
                                    ${article.views || 0} views
                                </span>
                            </div>
                        </div>
                    </a>
                    `;
        });
        articlesContainer.innerHTML = html;
    }

    function renderPagination(pagination) {
        if (pagination.pages <= 1) return;

        let html = '';
        for (let i = 1; i <= pagination.pages; i++) {
            if (i === pagination.page) {
                html += `
                        <button class="px-4 py-2 rounded-lg bg-[#8EF0DD] text-[#154D41] font-semibold">
                            ${i}
                        </button>
                        `;
            } else {
                html += `
                        <button onclick="window.fetchPage(${i})" class="px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-all">
                            ${i}
                        </button>
                        `;
            }
        }
        paginationContainer.innerHTML = html;
    }

    window.fetchPage = function (page) {
        window.history.pushState({ page }, "Page " + page, "?page=" + page);
        fetchInsights(page);
    };

    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = urlParams.get('page') ? parseInt(urlParams.get('page')) : 1;
    fetchInsights(initialPage);

    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.page) {
            fetchInsights(e.state.page);
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const page = urlParams.get('page') ? parseInt(urlParams.get('page')) : 1;
            fetchInsights(page);
        }
    });
});
