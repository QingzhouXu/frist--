document.addEventListener('DOMContentLoaded', () => {
    initProfilePage();
});

function initProfilePage() {
    const profileForm = document.getElementById('profile-edit-form');
    const avatarEditBtn = document.getElementById('avatar-edit-btn');
    const avatarInput = document.getElementById('avatar-input');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    // 初始化统计数据
    loadProfileStats();
    
    // 表单提交
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
    
    // 头像上传
    if (avatarEditBtn && avatarInput) {
        avatarEditBtn.addEventListener('click', () => {
            avatarInput.click();
        });
        
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
    
    // 取消编辑
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (profileForm) {
                profileForm.reset();
                showMessage('已取消编辑', 'info');
            }
        });
    }
}

function loadProfileStats() {
    // 加载收藏数量
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoritesCount = document.getElementById('favorites-count');
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }
    
    // 咨询数量（暂时设为0，因为没有存储）
    const chatsCount = document.getElementById('chats-count');
    if (chatsCount) {
        chatsCount.textContent = '0';
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const displayName = document.getElementById('edit-display-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    
    if (!displayName) {
        showMessage('昵称不能为空', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                display_name: displayName,
                phone: phone,
                email: email
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 更新页面显示
            const displayNameElement = document.getElementById('display-name');
            if (displayNameElement) {
                displayNameElement.textContent = displayName;
            }
            
            showMessage('个人资料更新成功', 'success');
        } else {
            showMessage(data.error || '更新失败', 'error');
        }
    } catch (error) {
        console.error('更新个人资料失败:', error);
        showMessage('网络错误，请重试', 'error');
    }
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件大小（限制为2MB）
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        showMessage('头像大小不能超过2MB', 'error');
        return;
    }
    
    // 读取文件并转换为base64
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64Data = e.target.result;
        
        // 显示预览
        const currentAvatar = document.getElementById('current-avatar');
        if (currentAvatar) {
            currentAvatar.src = base64Data;
        }
        
        // 保存头像
        saveAvatar(base64Data);
    };
    
    reader.onerror = () => {
        showMessage('头像读取失败', 'error');
    };
    
    reader.readAsDataURL(file);
}

async function saveAvatar(avatarData) {
    try {
        const response = await fetch('/api/profile/avatar', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                avatar_data: avatarData
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('头像更新成功', 'success');
        } else {
            showMessage(data.error || '头像更新失败', 'error');
        }
    } catch (error) {
        console.error('更新头像失败:', error);
        showMessage('网络错误，请重试', 'error');
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
