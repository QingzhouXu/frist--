document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const categorySections = document.querySelectorAll('.category-section');
    const shopGrid = document.getElementById('shop-grid');
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // 当前筛选状态
    let currentCategory = 'all';
    let currentSearch = '';

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

        // 收藏按钮事件委托
        categorySections.forEach(section => {
            section.addEventListener('click', (e) => {
                if (e.target.closest('.favorite-btn')) {
                    const btn = e.target.closest('.favorite-btn');
                    toggleFavorite(btn);
                }
            });
        });
    }

    function performSearch() {
        currentSearch = searchInput ? searchInput.value.trim() : '';
        filterMerchants();
    }

    function filterMerchants() {
        // categories页面使用category-section结构，不是shop-grid
        // 需要处理分类显示/隐藏
        categorySections.forEach(section => {
            const shopCards = section.querySelectorAll('.shop-card');
            let hasVisible = false;

            shopCards.forEach(card => {
                const merchantName = card.querySelector('h3').textContent.toLowerCase();
                const merchantCategory = card.querySelector('.shop-meta span').textContent.toLowerCase();
                const merchantSlogan = card.querySelector('p').textContent.toLowerCase();

                // 分类筛选
                const categoryMatch = currentCategory === 'all' || merchantCategory.includes(currentCategory.toLowerCase());

                // 搜索筛选
                const searchMatch = !currentSearch ||
                    merchantName.includes(currentSearch.toLowerCase()) ||
                    merchantCategory.includes(currentSearch.toLowerCase()) ||
                    merchantSlogan.includes(currentSearch.toLowerCase());

                if (categoryMatch && searchMatch) {
                    card.style.display = 'block';
                    hasVisible = true;
                } else {
                    card.style.display = 'none';
                }
            });

            // 隐藏没有匹配商家的分类区域
            section.style.display = hasVisible ? 'block' : 'none';
        });
    }

    function toggleFavorite(btn) {
        const merchantId = btn.dataset.merchantId;
        const merchantName = btn.dataset.merchantName;
        const heartIcon = btn.querySelector('.heart-icon');

        const index = favorites.findIndex(fav => fav.merchantId === merchantId);

        if (index === -1) {
            favorites.push({
                merchantId,
                merchantName,
                addedAt: new Date().toISOString()
            });
            heartIcon.textContent = '❤️';
            showMessage(`已收藏 ${merchantName}`, 'success');
        } else {
            favorites.splice(index, 1);
            heartIcon.textContent = '🤍';
            showMessage(`已取消收藏 ${merchantName}`, 'info');
        }

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

        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

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
