document.addEventListener('DOMContentLoaded', () => {
    initHistoryPage();
});

function initHistoryPage() {
    const merchantFilter = document.getElementById('merchant-filter');
    const searchInput = document.getElementById('search-input');
    
    // 初始化
    loadHistory();
    loadMerchantsFilter();
    
    // 筛选功能
    if (merchantFilter) {
        merchantFilter.addEventListener('change', filterHistory);
    }
    
    // 搜索功能
    if (searchInput) {
        searchInput.addEventListener('input', filterHistory);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterHistory();
            }
        });
    }
}

function loadHistory() {
    // 从localStorage获取历史记录
    const historyData = JSON.parse(localStorage.getItem('chat_history') || '{}');
    const historyArray = Object.entries(historyData).map(([merchantId, messages]) => ({
        merchantId,
        messages: messages || []
    }));
    
    if (historyArray.length === 0) {
        showEmptyState();
        return;
    }
    
    renderHistory(historyArray);
}

async function loadMerchantsFilter() {
    try {
        const response = await fetch('/api/merchants');
        const data = await response.json();
        
        if (data.merchants) {
            const merchantFilter = document.getElementById('merchant-filter');
            if (merchantFilter) {
                data.merchants.forEach(merchant => {
                    const option = document.createElement('option');
                    option.value = merchant.id;
                    option.textContent = merchant.name;
                    merchantFilter.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('加载商户列表失败:', error);
    }
}

async function renderHistory(historyArray) {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    try {
        // 获取商户信息
        const merchantsResponse = await fetch('/api/merchants');
        const merchantsData = await merchantsResponse.json();
        const merchants = merchantsData.merchants || [];
        
        let html = '';
        
        historyArray.forEach(history => {
            const merchant = merchants.find(m => m.id === history.merchantId);
            if (!merchant) return;
            
            const lastMessage = history.messages[history.messages.length - 1];
            const messageCount = history.messages.length;
            const lastTime = lastMessage ? new Date(lastMessage.timestamp) : new Date();
            
            html += `
                <article class="history-card" data-merchant-id="${history.merchantId}" data-message-count="${messageCount}">
                    <div class="history-info">
                        <div class="history-header-card">
                            <img src="${merchant.avatar || '/static/img/shops/avatar-store.svg'}" alt="${merchant.name}" class="merchant-avatar">
                            <div class="history-details">
                                <h3>${merchant.name}</h3>
                                <p>${merchant.category}</p>
                            </div>
                        </div>
                        <div class="history-meta">
                            <span>📅 最后咨询：${lastTime.toLocaleDateString()} ${lastTime.toLocaleTimeString()}</span>
                            <span>💬 共 ${messageCount} 条消息</span>
                        </div>
                    </div>
                    <div class="history-actions">
                        <button class="action-btn view-btn" onclick="viewHistory('${history.merchantId}')">查看详情</button>
                        <button class="action-btn delete-btn" onclick="deleteHistory('${history.merchantId}')">删除记录</button>
                    </div>
                </article>
            `;
        });
        
        historyList.innerHTML = html || showEmptyState();
    } catch (error) {
        console.error('渲染历史记录失败:', error);
        showErrorState();
    }
}

function showEmptyState() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    historyList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">💬</div>
            <h3>暂无咨询记录</h3>
            <p>当您与商家咨询后，历史记录会显示在这里</p>
            <a href="/" class="primary-action">去首页浏览商家</a>
        </div>
    `;
}

function showErrorState() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    historyList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3>加载失败</h3>
            <p>请刷新页面重试</p>
            <button class="primary-action" onclick="location.reload()">刷新页面</button>
        </div>
    `;
}

function filterHistory() {
    const merchantFilter = document.getElementById('merchant-filter');
    const searchInput = document.getElementById('search-input');
    const cards = document.querySelectorAll('.history-card');
    
    const merchantValue = merchantFilter ? merchantFilter.value : 'all';
    const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
    
    cards.forEach(card => {
        const merchantId = card.dataset.merchantId;
        const messageCount = parseInt(card.dataset.messageCount);
        
        const merchantMatch = merchantValue === 'all' || merchantId === merchantValue;
        const searchMatch = !searchValue || card.textContent.toLowerCase().includes(searchValue);
        
        if (merchantMatch && searchMatch) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    // 检查是否有结果
    const visibleCards = document.querySelectorAll('.history-card:not([style*="display: none"])');
    let noResultsMsg = document.querySelector('.no-filter-results');
    
    if (visibleCards.length === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-filter-results empty-state';
            noResultsMsg.innerHTML = `
                <div class="empty-state-icon">🔍</div>
                <h3>没有找到匹配的记录</h3>
                <p>尝试调整筛选条件或搜索关键词</p>
            `;
            document.getElementById('history-list').appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

function viewHistory(merchantId) {
    window.location.href = `/chat?merchant=${merchantId}`;
}

function deleteHistory(merchantId) {
    if (!confirm('确定要删除这个商家的咨询记录吗？此操作不可恢复。')) {
        return;
    }
    
    const historyData = JSON.parse(localStorage.getItem('chat_history') || '{}');
    if (historyData[merchantId]) {
        delete historyData[merchantId];
        localStorage.setItem('chat_history', JSON.stringify(historyData));
        showMessage('删除成功', 'success');
        loadHistory();
    }
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
