document.addEventListener('DOMContentLoaded', () => {
    const currentMerchantId = document.body.dataset.merchantId || 'tea_shop';

    const syncInfoBtn = document.querySelector('.merchant-panel button.soft-button');
    const generatePersonaBtn = document.querySelector('.merchant-panel button.primary-action');
    const regenerateBtn = document.querySelector('.persona-result button.soft-button');
    const savePersonaBtn = document.querySelector('.persona-result button.primary-action');

    const personaPreview = document.querySelector('.persona-preview');
    const personaName = document.querySelector('.persona-result h3');
    const personaDesc = document.querySelector('.persona-result p.muted-text');

    let currentPersona = {
        name: '',
        description: '',
        avatar: '🤖',
        generated: false
    };

    init();
    initEventListeners();

    async function init() {
        try {
            const response = await fetch(`/api/merchant/persona?merchant=${encodeURIComponent(currentMerchantId)}`);
            const data = await response.json();
            if (data.persona && data.persona.name) {
                currentPersona = { ...data.persona, generated: true };
                updatePersonaPreview(currentPersona.name, currentPersona.description, true, currentPersona.avatar || '🤖');
            }
        } catch (e) {
            // No saved persona yet — that's fine
        }
    }

    function initEventListeners() {
        if (syncInfoBtn) {
            syncInfoBtn.addEventListener('click', () => syncStoreInfo());
        }

        if (generatePersonaBtn) {
            generatePersonaBtn.addEventListener('click', () => generatePersona());
        }

        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => generatePersona());
        }

        if (savePersonaBtn) {
            savePersonaBtn.addEventListener('click', () => savePersona());
        }
    }

    async function syncStoreInfo() {
        try {
            syncInfoBtn.disabled = true;
            syncInfoBtn.textContent = '同步中...';

            const response = await fetch(`/api/knowledge?merchant=${encodeURIComponent(currentMerchantId)}`);
            const data = await response.json();

            if (data.merchant) {
                showMessage('店铺信息同步成功', 'success');
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
            if (generatePersonaBtn) {
                generatePersonaBtn.disabled = true;
                generatePersonaBtn.textContent = '生成中...';
            }
            if (regenerateBtn) {
                regenerateBtn.disabled = true;
                regenerateBtn.textContent = '生成中...';
            }

            showMessage('正在基于店铺信息生成AI形象...', 'info');

            const response = await fetch('/api/merchant/persona/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchant_id: currentMerchantId })
            });

            const data = await response.json();

            if (data.success && data.persona) {
                const p = data.persona;
                currentPersona = {
                    name: p.name,
                    description: p.description,
                    avatar: p.avatar || '🤖',
                    generated: true
                };
                updatePersonaPreview(p.name, p.description, true, p.avatar || '🤖');
                showMessage(data.fallback ? 'AI形象生成成功（本地模板）' : 'AI形象生成成功', 'success');
            } else {
                showMessage(data.error || '生成失败', 'error');
            }
        } catch (error) {
            console.error('生成AI形象失败:', error);
            showMessage('生成失败，请稍后重试', 'error');
        } finally {
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

            const response = await fetch('/api/merchant/persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchant_id: currentMerchantId,
                    persona: currentPersona
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage('AI形象保存成功并已上架展示', 'success');
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

    function updatePersonaPreview(name, description, generated, avatar) {
        if (personaName) {
            personaName.textContent = `已生成形象：${name}`;
        }

        if (personaDesc) {
            personaDesc.textContent = description;
        }

        if (personaPreview) {
            personaPreview.innerHTML = `
                <div style="font-size: 48px; text-align: center; margin-bottom: 8px;">${avatar || '🤖'}</div>
                <span>AI形象预览</span>
            `;
        }

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

    function showMessage(message, type) {
        var existingMessage = document.querySelector('.message-toast');
        if (existingMessage) existingMessage.remove();

        var messageDiv = document.createElement('div');
        messageDiv.className = 'message-toast ' + type;
        messageDiv.textContent = message;
        messageDiv.style.cssText = [
            'position: fixed',
            'top: 20px',
            'right: 20px',
            'padding: 12px 20px',
            'border-radius: 6px',
            'color: white',
            'font-size: 14px',
            'z-index: 9999',
            'transition: all 0.3s ease',
            'transform: translateX(100%)'
        ].join(';');

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

        setTimeout(function() {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(function() {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(function() {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
});
