document.addEventListener('DOMContentLoaded', () => {
    const currentMerchantId = document.body.dataset.merchantId || 'tea_shop';
    const summary = document.getElementById('merchant-summary');
    const list = document.getElementById('knowledge-list');
    const questionInput = document.getElementById('knowledge-question');
    const answerInput = document.getElementById('knowledge-answer');
    const addButton = document.getElementById('add-knowledge');
    const testQuestion = document.getElementById('consult-question');
    const testResult = document.getElementById('consult-result');
    const testButton = document.getElementById('test-consult');

    if (!list) return;

    loadQuestions();
    addButton?.addEventListener('click', addQuestion);
    testButton?.addEventListener('click', testConsultation);

    async function loadQuestions() {
        try {
            const response = await fetch(`/api/knowledge?merchant=${encodeURIComponent(currentMerchantId)}`);
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            const data = await response.json();
            if (summary) {
                summary.textContent = `${data.merchant.name} · ${data.knowledge.length} 条常见问题`;
            }
            list.innerHTML = '';
            data.knowledge.forEach((item) => {
                const row = document.createElement('div');
                row.className = 'knowledge-item';
                row.innerHTML = `
                    <div>
                        <strong>${escapeHtml(item.question)}</strong>
                        <p>${escapeHtml(item.answer)}</p>
                        <small>${escapeHtml(item.category || '常见问题')}</small>
                    </div>
                    <button data-id="${item.id}">删除</button>
                `;
                row.querySelector('button').addEventListener('click', () => deleteQuestion(item.id));
                list.appendChild(row);
            });
        } catch (error) {
            if (summary) summary.textContent = '内容加载失败';
            console.error(error);
        }
    }

    async function addQuestion() {
        const question = questionInput.value.trim();
        const answer = answerInput.value.trim();
        if (!question || !answer) {
            alert('请填写问题和回答');
            return;
        }
        const response = await fetch('/api/knowledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merchant_id: currentMerchantId, question, answer })
        });
        const data = await response.json();
        if (data.success) {
            questionInput.value = '';
            answerInput.value = '';
            await loadQuestions();
        } else {
            alert(data.error || '保存失败');
        }
    }

    async function deleteQuestion(id) {
        const response = await fetch(`/api/knowledge/${encodeURIComponent(id)}?merchant=${encodeURIComponent(currentMerchantId)}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            await loadQuestions();
        } else {
            alert('删除失败');
        }
    }

    async function testConsultation() {
        testResult.textContent = '正在模拟用户咨询...';
        try {
            const response = await fetch('/api/rag/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchant_id: currentMerchantId, question: testQuestion.value.trim() })
            });
            const data = await response.json();
            if (data.answer) {
                testResult.innerHTML = `
                    <small>${data.source === 'stable' ? '稳定命中' : '相似问题命中'} · 匹配度 ${Number(data.score).toFixed(2)}</small>
                    <strong>客服将回答：</strong>
                    <p>${escapeHtml(data.answer)}</p>
                `;
            } else {
                testResult.textContent = data.message || '暂未找到合适回答';
            }
        } catch (error) {
            testResult.textContent = '模拟咨询失败';
            console.error(error);
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
});
