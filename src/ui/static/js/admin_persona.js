document.addEventListener('DOMContentLoaded', () => {
    const currentMerchantId = document.body.dataset.merchantId || 'tea_shop';
    
    // 按钮元素
    const syncInfoBtn = document.querySelector('.merchant-panel button.soft-button');
    const generatePersonaBtn = document.querySelector('.merchant-panel button.primary-action');
    const regenerateBtn = document.querySelector('.persona-result button.soft-button');
    const savePersonaBtn = document.querySelector('.persona-result button.primary-action');
    
    // 预览元素
    const personaPreview = document.querySelector('.persona-preview');
    const personaName = document.querySelector('.persona-result h3');
    const personaDesc = document.querySelector('.persona-result p.muted-text');
    
    // 当前AI形象数据
    let currentPersona = {
        name: '咖啡师小美',
        description: '形象特征：亲切友好、专业服务，代表星巴克品牌形象，可在客服咨询中使用。',
        generated: false
    };
    
    // 初始化事件监听
    initEventListeners();
    
    function initEventListeners() {
        // 同步店铺信息按钮
        if (syncInfoBtn) {
            syncInfoBtn.addEventListener('click', () => {
                syncStoreInfo();
            });
        }
        
        // 一键生成AI形象按钮
        if (generatePersonaBtn) {
            generatePersonaBtn.addEventListener('click', () => {
                generatePersona();
            });
        }
        
        // 重新生成按钮
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                generatePersona();
            });
        }
        
        // 保存并上架展示按钮
        if (savePersonaBtn) {
            savePersonaBtn.addEventListener('click', () => {
                savePersona();
            });
        }
    }
    
    async function syncStoreInfo() {
        try {
            syncInfoBtn.disabled = true;
            syncInfoBtn.textContent = '同步中...';
            
            // 获取店铺信息
            const response = await fetch(`/api/knowledge?merchant=${encodeURIComponent(currentMerchantId)}`);
            const data = await response.json();
            
            if (data.success && data.merchant) {
                showMessage('店铺信息同步成功', 'success');
                
                // 基于店铺信息生成AI形象建议
                const merchant = data.merchant;
                const suggestedName = generatePersonaName(merchant.name, merchant.category);
                const suggestedDesc = generatePersonaDescription(merchant.name, merchant.category, merchant.slogan);
                
                // 更新预览
                updatePersonaPreview(suggestedName, suggestedDesc, false);
            } else {
                showMessage('店铺信息同步失败', 'error');
            }
        } catch (error) {
            console.error('同步店铺信息失败:', error);
            showMessage('网络错误，请稍后重试', 'error');
        } finally {
            syncInfoBtn.disabled = false;
            syncInfoBtn.textContent = '同步店铺信息';
        }
    }
    
    async function generatePersona() {
        try {
            // 禁用相关按钮
            if (generatePersonaBtn) {
                generatePersonaBtn.disabled = true;
                generatePersonaBtn.textContent = '生成中...';
            }
            if (regenerateBtn) {
                regenerateBtn.disabled = true;
                regenerateBtn.textContent = '生成中...';
            }
            
            // 模拟AI生成过程
            showMessage('正在基于店铺信息生成AI形象...', 'info');
            
            // 获取店铺信息
            const response = await fetch(`/api/knowledge?merchant=${encodeURIComponent(currentMerchantId)}`);
            const data = await response.json();
            
            if (data.success && data.merchant) {
                const merchant = data.merchant;
                
                // 模拟AI生成延迟
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // 生成AI形象
                const personaName = generatePersonaName(merchant.name, merchant.category);
                const personaDesc = generatePersonaDescription(merchant.name, merchant.category, merchant.slogan);
                const personaAvatar = generatePersonaAvatar(merchant.category);
                
                // 更新预览
                updatePersonaPreview(personaName, personaDesc, true, personaAvatar);
                currentPersona = {
                    name: personaName,
                    description: personaDesc,
                    avatar: personaAvatar,
                    generated: true
                };
                
                showMessage('AI形象生成成功', 'success');
            } else {
                showMessage('获取店铺信息失败', 'error');
            }
        } catch (error) {
            console.error('生成AI形象失败:', error);
            showMessage('生成失败，请稍后重试', 'error');
        } finally {
            // 恢复按钮状态
            if (generatePersonaBtn) {
                generatePersonaBtn.disabled = false;
                generatePersonaBtn.textContent = '一键生成AI形象';
            }
            if (regenerateBtn) {
                regenerateBtn.disabled = false;
                regenerateBtn.textContent = '重新生成';
            }
        }
    }
    
    async function savePersona() {
        if (!currentPersona.generated) {
            showMessage('请先生成AI形象', 'error');
            return;
        }
        
        try {
            savePersonaBtn.disabled = true;
            savePersonaBtn.textContent = '保存中...';
            
            // 调用API保存AI形象
            const response = await fetch('/api/merchant/persona', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    merchant_id: currentMerchantId,
                    persona: currentPersona
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('AI形象保存成功并已上架展示', 'success');
                
                // 更新按钮状态
                if (savePersonaBtn) {
                    savePersonaBtn.textContent = '已保存';
                    savePersonaBtn.disabled = true;
                }
            } else {
                showMessage(data.error || '保存失败', 'error');
            }
        } catch (error) {
            console.error('保存AI形象失败:', error);
            showMessage('网络错误，请稍后重试', 'error');
        } finally {
            if (savePersonaBtn && savePersonaBtn.textContent !== '已保存') {
                savePersonaBtn.disabled = false;
                savePersonaBtn.textContent = '保存并上架展示';
            }
        }
    }
    
    function generatePersonaName(merchantName, category) {
        // 基于店铺名称和类别生成AI形象名称
        const prefixes = ['小', '阿', '老', '大'];
        const suffixes = ['美', '丽', '强', '明', '华', '杰', '芳', '琳', '伟', '敏'];
        
        // 提取店铺名称关键词
        let keyword = '';
        if (merchantName.includes('星巴克')) keyword = '咖啡';
        else if (merchantName.includes('茶')) keyword = '茶';
        else if (merchantName.includes('咖啡')) keyword = '咖啡';
        else if (merchantName.includes('甜品')) keyword = '甜';
        else keyword = '店';
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return `${prefix}${keyword}${suffix}`;
    }
    
    function generatePersonaDescription(merchantName, category, slogan) {
        // 基于店铺信息生成AI形象描述
        const traits = ['亲切友好', '专业服务', '热情周到', '细心体贴', '知识渊博'];
        const skills = ['产品介绍', '服务推荐', '问题解答', '客户关怀'];
        
        const trait = traits[Math.floor(Math.random() * traits.length)];
        const skill = skills[Math.floor(Math.random() * skills.length)];
        
        return `形象特征：${trait}、${skill}，代表${merchantName}品牌形象，${category}专业顾问，可在客服咨询中为用户提供优质服务。${slogan ? `店铺理念：${slogan}` : ''}`;
    }
    
    function generatePersonaAvatar(category) {
        // 基于类别生成头像样式
        const avatarStyles = {
            '咖啡': '☕',
            '茶': '🍵',
            '甜品': '🍰',
            '饮品': '🥤',
            '餐饮': '🍽️'
        };
        
        return avatarStyles[category] || '🤖';
    }
    
    function updatePersonaPreview(name, description, generated, avatar = '🤖') {
        // 更新预览区域
        if (personaName) {
            personaName.textContent = `已生成形象：${name}`;
        }
        
        if (personaDesc) {
            personaDesc.textContent = description;
        }
        
        if (personaPreview) {
            personaPreview.innerHTML = `
                <div style="font-size: 48px; text-align: center; margin-bottom: 8px;">${avatar}</div>
                <span>AI形象预览</span>
            `;
        }
        
        // 更新按钮状态
        if (generated) {
            if (regenerateBtn) {
                regenerateBtn.style.display = 'inline-block';
            }
            if (savePersonaBtn) {
                savePersonaBtn.disabled = false;
                savePersonaBtn.textContent = '保存并上架展示';
            }
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
