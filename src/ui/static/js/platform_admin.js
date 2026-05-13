document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    startHeartbeat();
});

function initEventListeners() {
    // 审核按钮事件
    document.querySelectorAll('.review-card').forEach((card) => {
        const id = card.dataset.id;
        const approve = card.querySelector('.approve-btn');
        const reject = card.querySelector('.reject-btn');
        if (approve) approve.addEventListener('click', () => review(id, 'approve'));
        if (reject) reject.addEventListener('click', () => review(id, 'reject'));
    });

    // 筛选功能
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterApplications);
    }

    // 搜索功能
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterApplications);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterApplications();
            }
        });
    }

    // 商户搜索功能
    const merchantSearchInput = document.getElementById('merchant-search-input');
    if (merchantSearchInput) {
        merchantSearchInput.addEventListener('input', filterMerchants);
    }
}

async function review(id, action) {
    if (!confirm(`确定要${action === 'approve' ? '通过' : '拒绝'}这个申请吗？`)) {
        return;
    }

    try {
        const response = await fetch(`/api/platform/applications/${id}/${action}`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            showMessage('操作成功', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showMessage(data.error || '操作失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请重试', 'error');
    }
}

async function viewDetails(id) {
    try {
        const response = await fetch(`/api/platform/applications/${id}/details`);
        const data = await response.json();
        
        if (data.error) {
            showMessage(data.error, 'error');
            return;
        }

        const application = data.application;
        showDetailsModal(application);
    } catch (error) {
        showMessage('获取详情失败', 'error');
    }
}

function showDetailsModal(application) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    `;

    const statusLabels = {
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已拒绝'
    };

    const statusColors = {
        'pending': '#fff3cd',
        'approved': '#d4edda',
        'rejected': '#f8d7da'
    };

    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #2c3e50;">申请详情</h2>
            <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
        </div>
        
        <div style="margin-bottom: 20px;">
            <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; background: ${statusColors[application.status]}; color: #333; font-size: 12px; font-weight: 600;">
                ${statusLabels[application.status]}
            </span>
        </div>

        ${application.avatar_data ? `
        <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">店铺头像</label>
            <div style="text-align: center;">
                <div style="width: 120px; height: 120px; margin: 0 auto; border-radius: 50%; border: 3px solid #e9ecef; overflow: hidden; background: #f8f9fa;">
                    <img src="${application.avatar_data}" alt="店铺头像" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </div>
        </div>
        ` : ''}

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">商户名称</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${application.merchant_name}</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">商户类别</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${application.category}</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">联系方式</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${application.contact}</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">申请人账号</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${application.owner_username}</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">营业执照</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${application.license}</div>
        </div>

        ${application.license_data ? `
        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">资质文件</label>
            <div style="text-align: center;">
                <div style="max-width: 100%; max-height: 400px; margin: 0 auto; border-radius: 8px; border: 1px solid #e9ecef; overflow: hidden; background: #f8f9fa;">
                    <img src="${application.license_data}" alt="资质文件" style="width: 100%; height: 100%; object-fit: contain; display: block;">
                </div>
            </div>
        </div>
        ` : ''}

        ${application.status === 'pending' ? `
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="review('${application.id}', 'approve'); this.closest('.modal-overlay').remove();" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">审核通过</button>
            <button onclick="review('${application.id}', 'reject'); this.closest('.modal-overlay').remove();" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">拒绝申请</button>
        </div>
        ` : ''}
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function filterApplications() {
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    const cards = document.querySelectorAll('.review-card');

    const statusValue = statusFilter ? statusFilter.value : 'all';
    const searchValue = searchInput ? searchInput.value.toLowerCase() : '';

    cards.forEach(card => {
        const cardStatus = card.dataset.status;
        const merchantName = card.querySelector('h3').textContent.toLowerCase();
        const contact = card.querySelector('.review-details p').textContent.toLowerCase();

        const statusMatch = statusValue === 'all' || cardStatus === statusValue;
        const searchMatch = !searchValue || merchantName.includes(searchValue) || contact.includes(searchValue);

        if (statusMatch && searchMatch) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });

    // 检查是否有结果
    checkNoResults();
}

function checkNoResults() {
    const visibleCards = document.querySelectorAll('.review-card:not([style*="display: none"])');
    let noResultsMsg = document.querySelector('.no-filter-results');

    if (visibleCards.length === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-filter-results';
            noResultsMsg.style.cssText = `
                text-align: center;
                padding: 40px;
                color: #7f8c8d;
            `;
            noResultsMsg.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <h3>没有找到匹配的申请</h3>
                <p>尝试调整筛选条件或搜索关键词</p>
            `;
            document.getElementById('review-list').appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

function showTab(tabName) {
    // 更新标签页状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(getTabLabel(tabName))) {
            btn.classList.add('active');
        }
    });

    // 显示对应内容
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        if (tab.id === `${tabName}-tab`) {
            tab.style.display = 'block';
        } else {
            tab.style.display = 'none';
        }
    });

    // 加载对应数据
    if (tabName === 'merchants') {
        loadMerchants();
    } else if (tabName === 'statistics') {
        loadStatistics();
    } else if (tabName === 'settings') {
        loadSettings();
    } else if (tabName === 'official-chat') {
        loadOfficialMessages();
    }
}

async function loadMerchants() {
    try {
        const response = await fetch('/api/platform/merchants');
        const data = await response.json();
        
        if (data.error) {
            showMessage(data.error, 'error');
            return;
        }

        renderMerchants(data.merchants);
    } catch (error) {
        showMessage('加载商户数据失败', 'error');
    }
}

function renderMerchants(merchants) {
    const merchantList = document.getElementById('merchant-list');
    if (!merchantList) return;

    if (!merchants || merchants.length === 0) {
        merchantList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏪</div>
                <h3>暂无商户</h3>
                <p>当有商户入驻并通过审核后，会在这里显示</p>
            </div>
        `;
        return;
    }

    let html = '';
    merchants.forEach(merchant => {
        const status = merchant.status || 'active';
        const statusLabel = status === 'active' ? '正常' : '禁用';
        const statusColor = status === 'active' ? '#28a745' : '#dc3545';

        html += `
            <article class="review-card" data-merchant-id="${merchant.id}">
                <div class="review-info">
                    <div class="review-header">
                        <span style="display: inline-block; padding: 4px 10px; border-radius: 15px; background: ${statusColor}; color: white; font-size: 12px; font-weight: 600;">
                            ${statusLabel}
                        </span>
                        <h3>${merchant.name}</h3>
                    </div>
                    <div class="review-details">
                        <p>📂 ${merchant.category} ｜ ⭐ ${merchant.rating}分</p>
                        <p>${merchant.slogan}</p>
                    </div>
                </div>
                <div class="review-actions">
                    <button class="action-btn view-btn" onclick="viewMerchantDetails('${merchant.id}')">查看详情</button>
                    <button class="action-btn" onclick="toggleMerchantStatus('${merchant.id}', '${status}')" style="background: ${status === 'active' ? '#dc3545' : '#28a745'}; color: white;">
                        ${status === 'active' ? '禁用' : '启用'}
                    </button>
                    <button class="action-btn reject-btn" onclick="deleteMerchant('${merchant.id}')">删除</button>
                </div>
            </article>
        `;
    });

    merchantList.innerHTML = html;
}

async function viewMerchantDetails(merchantId) {
    try {
        const response = await fetch('/api/platform/merchants');
        const data = await response.json();
        
        if (data.error) {
            showMessage(data.error, 'error');
            return;
        }

        const merchant = data.merchants.find(m => m.id === merchantId);
        if (!merchant) {
            showMessage('商户不存在', 'error');
            return;
        }

        showMerchantDetailsModal(merchant);
    } catch (error) {
        showMessage('获取商户详情失败', 'error');
    }
}

function showMerchantDetailsModal(merchant) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    `;

    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #2c3e50;">商户详情</h2>
            <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">商户名称</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${merchant.name}</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">商户类别</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${merchant.category}</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">商户简介</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${merchant.slogan}</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">评分</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">⭐ ${merchant.rating}分</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">状态</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${merchant.status === 'active' ? '正常' : '禁用'}</div>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function toggleMerchantStatus(merchantId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const action = newStatus === 'active' ? '启用' : '禁用';

    if (!confirm(`确定要${action}这个商户吗？`)) {
        return;
    }

    try {
        const response = await fetch(`/api/platform/merchants/${merchantId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();

        if (data.success) {
            showMessage(`${action}成功`, 'success');
            loadMerchants();
        } else {
            showMessage(data.error || '操作失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请重试', 'error');
    }
}

async function deleteMerchant(merchantId) {
    if (!confirm('确定要删除这个商户吗？此操作不可恢复！')) {
        return;
    }

    try {
        const response = await fetch(`/api/platform/merchants/${merchantId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            showMessage('删除成功', 'success');
            loadMerchants();
        } else {
            showMessage(data.error || '删除失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请重试', 'error');
    }
}

function filterMerchants() {
    const searchInput = document.getElementById('merchant-search-input');
    const cards = document.querySelectorAll('#merchant-list .review-card');
    const searchValue = searchInput ? searchInput.value.toLowerCase() : '';

    cards.forEach(card => {
        const merchantName = card.querySelector('h3').textContent.toLowerCase();
        const merchantDetails = card.querySelector('.review-details p').textContent.toLowerCase();

        const searchMatch = !searchValue || merchantName.includes(searchValue) || merchantDetails.includes(searchValue);

        if (searchMatch) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });

    // 检查是否有结果
    const visibleCards = document.querySelectorAll('#merchant-list .review-card:not([style*="display: none"])');
    let noResultsMsg = document.querySelector('#merchant-list .no-filter-results');

    if (visibleCards.length === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-filter-results';
            noResultsMsg.style.cssText = `
                text-align: center;
                padding: 40px;
                color: #7f8c8d;
            `;
            noResultsMsg.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <h3>没有找到匹配的商户</h3>
                <p>尝试调整搜索关键词</p>
            `;
            document.getElementById('merchant-list').appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

async function loadStatistics() {
    try {
        const response = await fetch('/api/platform/statistics');
        const data = await response.json();
        
        if (data.error) {
            showMessage(data.error, 'error');
            return;
        }

        renderStatistics(data);
    } catch (error) {
        showMessage('加载统计数据失败', 'error');
    }
}

function renderStatistics(stats) {
    const statisticsTab = document.getElementById('statistics-tab');
    if (!statisticsTab) return;

    let categoryHtml = '';
    for (const [category, count] of Object.entries(stats.category_stats)) {
        categoryHtml += `
            <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
                <span>${category}</span>
                <strong>${count}家</strong>
            </div>
        `;
    }

    let topMerchantsHtml = '';
    if (stats.merchants && stats.merchants.length > 0) {
        const sortedMerchants = [...stats.merchants].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
        sortedMerchants.forEach((merchant, index) => {
            topMerchantsHtml += `
                <div style="display: flex; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
                    <span style="width: 24px; height: 24px; background: #3498db; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px;">${index + 1}</span>
                    <span style="flex: 1;">${merchant.name}</span>
                    <span style="color: #f39c12;">⭐ ${merchant.rating}分</span>
                </div>
            `;
        });
    }

    statisticsTab.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="stat-card">
                <div class="stat-number">${stats.total_users}</div>
                <div class="stat-label">总用户数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.total_merchants}</div>
                <div class="stat-label">总商户数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.pending_applications}</div>
                <div class="stat-label">待审核申请</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.approved_applications}</div>
                <div class="stat-label">已通过申请</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.total_messages}</div>
                <div class="stat-label">客服消息总数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.unread_messages}</div>
                <div class="stat-label">未读消息</div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div style="background: white; border-radius: 15px; padding: 25px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);">
                <h3 style="color: #2c3e50; margin-bottom: 20px; font-size: 18px;">📂 商户分类统计</h3>
                ${categoryHtml || '<p style="color: #7f8c8d; text-align: center;">暂无数据</p>'}
            </div>

            <div style="background: white; border-radius: 15px; padding: 25px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);">
                <h3 style="color: #2c3e50; margin-bottom: 20px; font-size: 18px;">🏆 热门商户排行</h3>
                ${topMerchantsHtml || '<p style="color: #7f8c8d; text-align: center;">暂无数据</p>'}
            </div>
        </div>
    `;
}

async function loadSettings() {
    try {
        const response = await fetch('/api/platform/settings');
        const data = await response.json();
        
        if (data.error) {
            showMessage(data.error, 'error');
            return;
        }

        renderSettings(data.settings);
    } catch (error) {
        showMessage('加载设置失败', 'error');
    }
}

function renderSettings(settings) {
    const settingsTab = document.getElementById('settings-tab');
    if (!settingsTab) return;

    settingsTab.innerHTML = `
        <div style="max-width: 600px;">
            <div style="margin-bottom: 30px;">
                <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">平台名称</label>
                <input type="text" id="platform-name" value="${settings.platform_name || ''}" style="width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px;">
            </div>

            <div style="margin-bottom: 30px;">
                <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">平台描述</label>
                <textarea id="platform-description" rows="4" style="width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; resize: vertical;">${settings.platform_description || ''}</textarea>
            </div>

            <div style="margin-bottom: 30px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="enable-registration" ${settings.enable_registration ? 'checked' : ''} style="width: 18px; height: 18px; margin-right: 10px;">
                    <span style="font-weight: 600; color: #2c3e50;">启用用户注册</span>
                </label>
                <p style="color: #7f8c8d; font-size: 14px; margin-top: 5px; margin-left: 28px;">允许新用户注册账号</p>
            </div>

            <div style="margin-bottom: 30px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="enable-merchant-application" ${settings.enable_merchant_application ? 'checked' : ''} style="width: 18px; height: 18px; margin-right: 10px;">
                    <span style="font-weight: 600; color: #2c3e50;">启用商户入驻申请</span>
                </label>
                <p style="color: #7f8c8d; font-size: 14px; margin-top: 5px; margin-left: 28px;">允许商户提交入驻申请</p>
            </div>

            <div style="margin-bottom: 30px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="auto-approve-merchant" ${settings.auto_approve_merchant ? 'checked' : ''} style="width: 18px; height: 18px; margin-right: 10px;">
                    <span style="font-weight: 600; color: #2c3e50;">自动审核商户</span>
                </label>
                <p style="color: #7f8c8d; font-size: 14px; margin-top: 5px; margin-left: 28px;">自动通过商户入驻申请（谨慎使用）</p>
            </div>

            <div style="margin-top: 40px;">
                <button onclick="saveSettings()" style="padding: 12px 30px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">保存设置</button>
            </div>
        </div>
    `;
}

async function saveSettings() {
    const platformName = document.getElementById('platform-name').value;
    const platformDescription = document.getElementById('platform-description').value;
    const enableRegistration = document.getElementById('enable-registration').checked;
    const enableMerchantApplication = document.getElementById('enable-merchant-application').checked;
    const autoApproveMerchant = document.getElementById('auto-approve-merchant').checked;

    try {
        const response = await fetch('/api/platform/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                platform_name: platformName,
                platform_description: platformDescription,
                enable_registration: enableRegistration,
                enable_merchant_application: enableMerchantApplication,
                auto_approve_merchant: autoApproveMerchant
            })
        });
        const data = await response.json();

        if (data.success) {
            showMessage('设置保存成功', 'success');
        } else {
            showMessage(data.error || '保存失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请重试', 'error');
    }
}

function getTabLabel(tabName) {
    const labels = {
        'applications': '入驻审核',
        'merchants': '商户管理',
        'statistics': '数据统计',
        'settings': '平台设置',
        'official-chat': '官方客服'
    };
    return labels[tabName] || '';
}

async function loadOfficialMessages() {
    try {
        const response = await fetch('/api/official-support/messages');
        const data = await response.json();
        
        if (data.error) {
            showMessage(data.error, 'error');
            return;
        }

        renderOfficialMessages(data.messages || []);
    } catch (error) {
        showMessage('加载消息数据失败', 'error');
    }
}

function renderOfficialMessages(messages) {
    const messageList = document.getElementById('message-list');
    if (!messageList) return;

    if (!messages || messages.length === 0) {
        messageList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <h3>暂无消息</h3>
                <p>当有用户发送消息时，会在这里显示</p>
            </div>
        `;
        return;
    }

    let html = '';
    messages.forEach(message => {
        const status = message.status || 'pending';
        const statusLabel = status === 'pending' ? '待处理' : '已回复';
        const statusColor = status === 'pending' ? '#ffc107' : '#28a745';

        html += `
            <article class="review-card" data-message-id="${message.id}" data-status="${status}">
                <div class="review-info">
                    <div class="review-header">
                        <span style="display: inline-block; padding: 4px 10px; border-radius: 15px; background: ${statusColor}; color: white; font-size: 12px; font-weight: 600;">
                            ${statusLabel}
                        </span>
                        <h3>${message.username || '匿名用户'}</h3>
                    </div>
                    <div class="review-details">
                        <p>💬 ${message.message}</p>
                        <div class="review-meta">
                            <span>📅 发送时间：${new Date(message.timestamp).toLocaleString()}</span>
                            <span>📧 联系方式：${message.contact || '未提供'}</span>
                        </div>
                    </div>
                </div>
                <div class="review-actions">
                    <button class="action-btn view-btn" onclick="viewMessageDetails('${message.id}')">查看详情</button>
                    ${status === 'pending' ? `
                    <button class="action-btn approve-btn" onclick="replyMessage('${message.id}')">回复</button>
                    ` : ''}
                </div>
            </article>
        `;
    });

    messageList.innerHTML = html;
}

async function viewMessageDetails(messageId) {
    try {
        const response = await fetch('/api/official-support/messages');
        const data = await response.json();
        
        if (data.error) {
            showMessage(data.error, 'error');
            return;
        }

        const message = (data.messages || []).find(m => m.id === messageId);
        if (!message) {
            showMessage('消息不存在', 'error');
            return;
        }

        showMessageDetailsModal(message);
    } catch (error) {
        showMessage('获取消息详情失败', 'error');
    }
}

function showMessageDetailsModal(message) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    `;

    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #2c3e50;">消息详情</h2>
            <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">用户</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${message.username || '匿名用户'}</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">联系方式</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${message.contact || '未提供'}</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">消息内容</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${message.message}</div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">发送时间</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px;">${new Date(message.timestamp).toLocaleString()}</div>
        </div>

        ${message.reply ? `
        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">回复内容</label>
            <div style="padding: 10px; background: #e8f5e9; border-radius: 8px;">${message.reply}</div>
        </div>
        ` : ''}

        ${!message.reply ? `
        <div style="margin-top: 20px;">
            <label style="display: block; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">快速回复</label>
            <textarea id="quick-reply" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; min-height: 100px;" placeholder="输入回复内容..."></textarea>
            <button onclick="sendQuickReply('${message.id}')" style="margin-top: 10px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer;">发送回复</button>
        </div>
        ` : ''}
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function sendQuickReply(messageId) {
    const replyText = document.getElementById('quick-reply').value.trim();
    if (!replyText) {
        showMessage('回复内容不能为空', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/official-support/messages/${messageId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reply: replyText })
        });
        const data = await response.json();

        if (data.success) {
            showMessage('回复成功', 'success');
            document.querySelector('.modal-overlay').remove();
            loadOfficialMessages();
        } else {
            showMessage(data.error || '回复失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请重试', 'error');
    }
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

function startHeartbeat() {
    const statusEl = document.getElementById('board-status');
    if (!statusEl) return;

    async function refresh() {
        try {
            const response = await fetch('/api/heartbeat');
            const data = await response.json();
            if (data.status === 'success') {
                statusEl.className = 'board-status online';
                statusEl.textContent = `🟢 本地智能服务已连接（${data.latency}ms）`;
            } else {
                statusEl.className = 'board-status offline';
                statusEl.textContent = '🔴 本地智能服务离线';
            }
        } catch {
            statusEl.className = 'board-status offline';
            statusEl.textContent = '🔴 本地智能服务离线';
        }
    }

    refresh();
    setInterval(refresh, 5000);
}
