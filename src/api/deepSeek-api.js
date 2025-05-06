import axios from 'axios';

// API常量
const apiKey = 'sk-0ff7eb791fa946e0afb8c61179a21eb3'; // 替换成你的API Key
const apiUrl = 'https://api.deepseek.com/v1/chat/completions'; // 确认API地址

// 提交消息到 API 并返回结果
export const submitMessageToApi = async (inputMessage,onData) => {
    if (!inputMessage.trim()) return null;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "user", content: inputMessage }],
                temperature: 1.3,
                stream: true  // 启用流式
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        let fullMessage = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunkText = decoder.decode(value, { stream: true });

            // 可能包含多行 data: 字段，用换行分割
            const lines = chunkText.split('\n').filter(line => line.trim().startsWith('data:'));

            for (const line of lines) {
                const jsonStr = line.replace(/^data:\s*/, '').trim();

                // 结束标识
                if (jsonStr === '[DONE]') break;

                try {
                    const parsed = JSON.parse(jsonStr);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                        onData(content);           // 实时推送内容给前端显示
                        fullMessage += content;    // 收集完整消息
                    }
                } catch (e) {
                    console.warn('解析失败:', e, jsonStr);
                }
            }
        }
        return fullMessage;

    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Error occurred while fetching response');
    }
};
