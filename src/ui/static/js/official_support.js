document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatForm = document.getElementById('chat-form');
    
    // 初始化
    initEventListeners();
    
    function initEventListeners() {
        if (chatForm) {
            chatForm.addEventListener('submit', sendMessage);
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
        
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
    }
    
    function sendMessage(e) {
        if (e) e.preventDefault();
        
        const message = messageInput ? messageInput.value.trim() : '';
        if (!message) return;
        
        // 添加用户消息
        addMessage(message, 'user');
        
        // 清空输入框
        if (messageInput) {
            messageInput.value = '';
        }
        
        // 禁用发送按钮
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.textContent = '发送中...';
        }
        
        // 获取用户信息
        const user = getCurrentUser();
        
        // 发送到后端API
        fetch('/api/official-support/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                user_info: user
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addMessage(data.response, 'official');
            } else {
                addMessage('抱歉，发送失败，请稍后重试。', 'official');
            }
        })
        .catch(error => {
            console.error('发送消息失败:', error);
            // 如果API失败，使用本地模拟回复作为后备
            const response = generateOfficialResponse(message);
            addMessage(response, 'official');
        })
        .finally(() => {
            // 恢复发送按钮
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.textContent = '发送';
            }
        });
    }
    
    function getCurrentUser() {
        // 从页面获取当前用户信息
        const userInfo = document.querySelector('.support-user-info span');
        const username = userInfo ? userInfo.textContent : '访客用户';
        
        return {
            username: username,
            timestamp: new Date().toISOString()
        };
    }
    
    function addMessage(content, type) {
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatar = type === 'user' ? '👤' : '🎯';
        const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div>${content}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function generateOfficialResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // 常见问题回复
        if (message.includes('注册') || message.includes('账号')) {
            return '您可以在首页点击"登录/注册"按钮创建账号。注册后即可收藏店铺和使用AI客服服务。如果遇到问题，可以尝试使用演示账号：user/123456';
        }
        
        if (message.includes('商户') || message.includes('入驻') || message.includes('申请')) {
            return '商户入驻请访问首页，点击"商户入驻申请"按钮。填写相关信息并提交申请，平台管理员会在1-3个工作日内审核。审核通过后即可使用商家管理后台。';
        }
        
        if (message.includes('ai') || message.includes('客服') || message.includes('机器人')) {
            return '我们的AI客服基于先进的自然语言处理技术，可以理解用户意图并提供准确的回复。商家可以在后台自定义AI形象和知识库，提升服务质量。';
        }
        
        if (message.includes('收藏') || message.includes('喜欢')) {
            return '您可以在店铺卡片上点击"收藏"按钮来收藏喜欢的店铺。收藏后可以在"我的收藏"页面快速访问。目前收藏数据保存在本地，建议登录后使用以获得更好体验。';
        }
        
        if (message.includes('搜索') || message.includes('找')) {
            return '您可以使用首页的搜索功能查找店铺，支持按店铺名称、类别或关键词搜索。也可以访问"全部分类"页面按类别浏览。';
        }
        
        if (message.includes('问题') || message.includes('帮助') || message.includes('怎么用')) {
            return '平台主要功能包括：\n1. 浏览和搜索商家店铺\n2. 与AI客服实时对话\n3. 收藏喜欢的店铺\n4. 商户入驻和管理\n5. 官方客服支持\n\n您有具体想了解的功能吗？';
        }
        
        if (message.includes('费用') || message.includes('价格') || message.includes('收费')) {
            return '目前平台处于测试阶段，所有功能均免费使用。后续可能会推出付费增值服务，但基础功能将保持免费。';
        }
        
        if (message.includes('安全') || message.includes('隐私')) {
            return '我们非常重视用户隐私和数据安全。所有对话数据都经过加密处理，不会泄露给第三方。商家只能看到自己店铺的对话记录。';
        }
        
        if (message.includes('投诉') || message.includes('举报')) {
            return '如果您遇到问题需要投诉，请提供详细的信息：\n1. 相关店铺名称\n2. 问题描述\n3. 发生时间\n\n我们会尽快处理并回复您。';
        }
        
        // 默认回复
        const defaultResponses = [
            '感谢您的咨询！我会尽力帮助您解决问题。请详细描述您的需求。',
            '我理解您的问题。让我为您提供一些有用的信息和建议。',
            '很高兴为您服务！如果您有其他问题，随时可以询问。',
            '您的反馈对我们很重要。请告诉我更多详细信息，以便更好地帮助您。'
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // 自动聚焦输入框
    if (messageInput) {
        messageInput.focus();
    }
});
