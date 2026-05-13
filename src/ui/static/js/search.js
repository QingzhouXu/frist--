document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sortSelect = document.getElementById('sort-select');
    const shopGrid = document.getElementById('shop-grid');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');

    // 当前搜索状态
    let currentSearch = searchInput ? searchInput.value.trim() : '';
    let currentCategory = 'all';
    let currentSort = 'relevance';
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // 初始化
    initEventListeners();
    updateFavoriteButtons();

    function initEventListeners() {
        // 搜索功能
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }

        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // 分类筛选
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                filterMerchants();
            });
        });

        // 排序功能
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                currentSort = sortSelect.value;
                sortResults();
            });
        }

        // 搜索建议标签
        if (suggestionTags) {
            suggestionTags.forEach(tag => {
                tag.addEventListener('click', () => {
                    if (searchInput) {
                        searchInput.value = tag.textContent;
                        performSearch();
                    }
                });
            });
        }

        // 收藏按钮事件委托
        if (shopGrid) {
            shopGrid.addEventListener('click', (e) => {
                if (e.target.closest('.favorite-btn')) {
                    const btn = e.target.closest('.favorite-btn');
                    toggleFavorite(btn);
                }
            });
        }
    }

    function performSearch() {
        currentSearch = searchInput ? searchInput.value.trim() : '';

        // 更新URL参数
        const url = new URL(window.location);
        if (currentSearch) {
            url.searchParams.set('q', currentSearch);
        } else {
            url.searchParams.delete('q');
        }
        window.history.pushState({}, '', url);

        // 执行搜索
        if (currentSearch) {
            filterMerchants();
        } else {
            // 如果搜索为空，重定向到首页
            window.location.href = '/';
        }
    }

    function filterMerchants() {
        const shopCards = document.querySelectorAll('.shop-card');

        shopCards.forEach(card => {
            const merchantName = card.querySelector('h2').textContent.toLowerCase();
            const merchantCategory = card.querySelector('.shop-meta span').textContent.toLowerCase();
            const merchantSlogan = card.querySelector('p').textContent.toLowerCase();

            // 分类筛选
            const categoryMatch = currentCategory === 'all' || merchantCategory.includes(currentCategory.toLowerCase());

            // 搜索筛选
            const searchMatch = !currentSearch ||
                merchantName.includes(currentSearch.toLowerCase()) ||
                merchantCategory.includes(currentSearch.toLowerCase()) ||
                merchantSlogan.includes(currentSearch.toLowerCase());

            // 显示或隐藏卡片
            if (categoryMatch && searchMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        // 应用排序
        sortResults();
    }

    function sortResults() {
        const shopCards = Array.from(document.querySelectorAll('.shop-card:not([style*="display: none"])'));

        shopCards.sort((a, b) => {
            switch (currentSort) {
                case 'rating':
                    const ratingA = parseFloat(a.querySelector('.shop-meta strong').textContent);
                    const ratingB = parseFloat(b.querySelector('.shop-meta strong').textContent);
                    return ratingB - ratingA;

                case 'name':
                    const nameA = a.querySelector('h2').textContent;
                    const nameB = b.querySelector('h2').textContent;
                    return nameA.localeCompare(nameB);

                case 'relevance':
                default:
                    // 相关度排序：优先显示名称完全匹配的
                    const nameA = a.querySelector('h2').textContent.toLowerCase();
                    const nameB = b.querySelector('h2').textContent.toLowerCase();
                    const searchLower = currentSearch.toLowerCase();

                    const aExactMatch = nameA === searchLower;
                    const bExactMatch = nameB === searchLower;

                    if (aExactMatch && !bExactMatch) return -1;
                    if (!aExactMatch && bExactMatch) return 1;

                    return nameA.localeCompare(nameB);
            }
        });

        // 重新排列DOM元素
        shopCards.forEach(card => {
            shopGrid.appendChild(card);
        });
    }

    function toggleFavorite(btn) {
        const merchantId = btn.dataset.merchantId;
        const merchantName = btn.dataset.merchantName;
        const heartIcon = btn.querySelector('.heart-icon');

        const index = favorites.findIndex(fav => fav.merchantId === merchantId);

        if (index === -1) {
            // 添加到收藏
            favorites.push({
                merchantId,
                merchantName,
                addedAt: new Date().toISOString()
            });
            heartIcon.textContent = '❤️';
            showMessage(`已收藏 ${merchantName}`, 'success');
        } else {
            // 从收藏中移除
            favorites.splice(index, 1);
            heartIcon.textContent = '🤍';
            showMessage(`已取消收藏 ${merchantName}`, 'info');
        }

        // 保存到本地存储
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    function updateFavoriteButtons() {
        const favoriteBtns = document.querySelectorAll('.favorite-btn');

        favoriteBtns.forEach(btn => {
            const merchantId = btn.dataset.merchantId;
            const heartIcon = btn.querySelector('.heart-icon');

            if (favorites.some(fav => fav.merchantId === merchantId)) {
                heartIcon.textContent = '❤️';
            } else {
                heartIcon.textContent = '🤍';
            }
        });
    }

    function showMessage(message, type = 'info') {
        // 移除已存在的消息
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) existingMessage.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            z-index: 9999;
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;

        // 设置背景色
        switch (type) {
            case 'success':
                messageDiv.style.backgroundColor = '#28a745';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#dc3545';
                break;
            case 'info':
                messageDiv.style.backgroundColor = '#17a2b8';
                break;
        }

        document.body.appendChild(messageDiv);

        // 显示动画
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
});
