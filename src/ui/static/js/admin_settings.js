document.addEventListener('DOMContentLoaded', () => {
    // 获取当前用户信息
    const currentMerchantId = document.body.dataset.merchantId || 'tea_shop';
    
    // 设置按钮元素
    const changePasswordBtn = document.querySelector('.setting-row:first-child button');
    const changePhoneBtn = document.querySelector('.setting-row:nth-child(2) button');
    const saveSettingsBtn = document.querySelector('.form-actions .primary-action');
    const deleteAccountBtn = document.querySelector('.form-actions .danger-outline');
    
    // 初始化事件监听
    initEventListeners();
    
    function initEventListeners() {
        // 修改密码按钮
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                showPasswordModal();
            });
        }
        
        // 更换手机号按钮
        if (changePhoneBtn) {
            changePhoneBtn.addEventListener('click', () => {
                showPhoneModal();
            });
        }
        
        // 保存设置按钮
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                showMessage('设置已保存', 'success');
            });
        }
        
        // 注销商铺按钮
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                showDeleteConfirmModal();
            });
        }
    }
    
    function showPasswordModal() {
        // 创建修改密码弹窗
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
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
        modalContent.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <h3>修改登录密码</h3>
            <div style="margin: 16px 0;">
                <label style="display: block; margin-bottom: 8px;">当前密码</label>
                <input type="password" id="current-password" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="margin: 16px 0;">
                <label style="display: block; margin-bottom: 8px;">新密码</label>
                <input type="password" id="new-password" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="margin: 16px 0;">
                <label style="display: block; margin-bottom: 8px;">确认新密码</label>
                <input type="password" id="confirm-password" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <button class="cancel-btn soft-button" style="margin-right: 8px;">取消</button>
                <button class="confirm-btn primary-action">确认修改</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 添加事件监听
        const cancelBtn = modalContent.querySelector('.cancel-btn');
        const confirmBtn = modalContent.querySelector('.confirm-btn');
        const currentPasswordInput = modalContent.querySelector('#current-password');
        const newPasswordInput = modalContent.querySelector('#new-password');
        const confirmPasswordInput = modalContent.querySelector('#confirm-password');
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        confirmBtn.addEventListener('click', async () => {
            const currentPassword = currentPasswordInput.value.trim();
            const newPassword = newPasswordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            
            // 验证输入
            if (!currentPassword || !newPassword || !confirmPassword) {
                showMessage('请填写所有密码字段', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showMessage('新密码长度至少6位', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showMessage('两次输入的新密码不一致', 'error');
                return;
            }
            
            try {
                confirmBtn.disabled = true;
                confirmBtn.textContent = '修改中...';
                
                // 调用API修改密码
                const response = await fetch('/api/merchant/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        merchant_id: currentMerchantId,
                        current_password: currentPassword,
                        new_password: newPassword
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    document.body.removeChild(modal);
                    showMessage('密码修改成功', 'success');
                } else {
                    showMessage(data.error || '密码修改失败', 'error');
                }
            } catch (error) {
                console.error('修改密码失败:', error);
                showMessage('网络错误，请稍后重试', 'error');
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = '确认修改';
            }
        });
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    function showPhoneModal() {
        // 创建更换手机号弹窗
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
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
        modalContent.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <h3>更换绑定手机号</h3>
            <div style="margin: 16px 0;">
                <label style="display: block; margin-bottom: 8px;">新手机号</label>
                <input type="tel" id="new-phone" placeholder="请输入新手机号" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="margin: 16px 0;">
                <label style="display: block; margin-bottom: 8px;">验证码</label>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="verify-code" placeholder="请输入验证码" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <button id="send-code-btn" class="outline-action">发送验证码</button>
                </div>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <button class="cancel-btn soft-button" style="margin-right: 8px;">取消</button>
                <button class="confirm-btn primary-action">确认更换</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 添加事件监听
        const cancelBtn = modalContent.querySelector('.cancel-btn');
        const confirmBtn = modalContent.querySelector('.confirm-btn');
        const sendCodeBtn = modalContent.querySelector('#send-code-btn');
        const newPhoneInput = modalContent.querySelector('#new-phone');
        const verifyCodeInput = modalContent.querySelector('#verify-code');
        
        let countdown = 0;
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        sendCodeBtn.addEventListener('click', () => {
            const phone = newPhoneInput.value.trim();
            if (!phone) {
                showMessage('请输入手机号', 'error');
                return;
            }
            
            if (!/^1[3-9]\d{9}$/.test(phone)) {
                showMessage('请输入正确的手机号格式', 'error');
                return;
            }
            
            // 模拟发送验证码
            countdown = 60;
            sendCodeBtn.disabled = true;
            sendCodeBtn.textContent = `${countdown}秒后重试`;
            
            const timer = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    sendCodeBtn.textContent = `${countdown}秒后重试`;
                } else {
                    clearInterval(timer);
                    sendCodeBtn.disabled = false;
                    sendCodeBtn.textContent = '发送验证码';
                }
            }, 1000);
            
            showMessage('验证码已发送', 'success');
        });
        
        confirmBtn.addEventListener('click', async () => {
            const phone = newPhoneInput.value.trim();
            const code = verifyCodeInput.value.trim();
            
            if (!phone || !code) {
                showMessage('请填写手机号和验证码', 'error');
                return;
            }
            
            try {
                confirmBtn.disabled = true;
                confirmBtn.textContent = '更换中...';
                
                // 调用API更换手机号
                const response = await fetch('/api/merchant/change-phone', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        merchant_id: currentMerchantId,
                        new_phone: phone,
                        verify_code: code
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    document.body.removeChild(modal);
                    showMessage('手机号更换成功', 'success');
                    // 更新页面显示
                    const phoneDisplay = document.querySelector('.setting-row:nth-child(2) small');
                    if (phoneDisplay) {
                        phoneDisplay.textContent = `当前绑定：${phone.substring(0, 3)}****${phone.substring(7)}`;
                    }
                } else {
                    showMessage(data.error || '手机号更换失败', 'error');
                }
            } catch (error) {
                console.error('更换手机号失败:', error);
                showMessage('网络错误，请稍后重试', 'error');
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = '确认更换';
            }
        });
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    function showDeleteConfirmModal() {
        // 创建注销确认弹窗
        const modal = document.createElement('div');
        modal.className = 'delete-modal';
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
        modalContent.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <h3 style="color: #dc3545;">注销商铺</h3>
            <div style="margin: 16px 0;">
                <p style="color: #666;">⚠️ 注销商铺后将产生以下影响：</p>
                <ul style="color: #666; margin: 12px 0; padding-left: 20px;">
                    <li>所有店铺数据将被永久删除</li>
                    <li>用户将无法搜索到您的店铺</li>
                    <li>AI客服服务将停止</li>
                    <li>此操作不可恢复</li>
                </ul>
                <p style="color: #666;">请输入 <strong>"注销确认"</strong> 来确认此操作：</p>
                <input type="text" id="confirm-text" placeholder="请输入：注销确认" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px;">
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <button class="cancel-btn soft-button" style="margin-right: 8px;">取消</button>
                <button class="confirm-btn danger-outline">确认注销</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 添加事件监听
        const cancelBtn = modalContent.querySelector('.cancel-btn');
        const confirmBtn = modalContent.querySelector('.confirm-btn');
        const confirmTextInput = modalContent.querySelector('#confirm-text');
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        confirmBtn.addEventListener('click', async () => {
            const confirmText = confirmTextInput.value.trim();
            
            if (confirmText !== '注销确认') {
                showMessage('请输入正确的确认文字', 'error');
                return;
            }
            
            try {
                confirmBtn.disabled = true;
                confirmBtn.textContent = '注销中...';
                
                // 调用API注销商铺
                const response = await fetch('/api/merchant/delete-account', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        merchant_id: currentMerchantId
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage('商铺注销成功，即将跳转到首页', 'success');
                    setTimeout(() => {
                        window.location.href = '/logout';
                    }, 2000);
                } else {
                    showMessage(data.error || '注销失败', 'error');
                }
            } catch (error) {
                console.error('注销失败:', error);
                showMessage('网络错误，请稍后重试', 'error');
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = '确认注销';
            }
        });
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
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
