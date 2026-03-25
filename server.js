import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post("/generate", async (req, res) => {
  const { topic } = req.body;
  
  if (!topic) {
    return res.status(400).json({ error: "请输入主题" });
  }

  const prompt = `
你是一个顶级小红书爆款文案专家。
请根据主题生成10个吸引人的小红书标题，要求：
1. 每个标题都要有爆款潜质
2. 可以使用emoji、数字、夸张手法
3. 风格要多样化，包括：干货类、情感类、种草类、悬念类

主题：${topic}

请直接返回10个标题，每个标题一行，不要添加额外说明。
`;

  try {
    // 你的真实API Key
    // const API_KEY = "sk-37ff9b0eebe54992b6de9cce2dfa48fb";
    const API_KEY = "sk-37ff9b0eebe54992b6de9cce2dfa4";
    
    // 检查API Key是否有效（修改这里的判断）
    if (!API_KEY || API_KEY === "请替换为你的API_KEY") {
      console.log("未配置有效的API Key，使用模拟数据");
      const mockTitles = generateMockTitles(topic);
      return res.json({ result: mockTitles });
    }
    
    console.log("正在调用DeepSeek API...");
    
    // 调用DeepSeek API
    const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个专业的小红书爆款标题生成专家，每次只返回标题，每行一个，不要有其他内容" },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });
    
    // 检查HTTP状态
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`API返回错误状态 ${aiResponse.status}:`, errorText);
      throw new Error(`API请求失败: ${aiResponse.status} - ${errorText}`);
    }
    
    const aiData = await aiResponse.json();
    console.log("API返回成功");
    
    // 安全地获取返回内容
    let result = "";
    if (aiData && 
        aiData.choices && 
        Array.isArray(aiData.choices) && 
        aiData.choices.length > 0 && 
        aiData.choices[0].message && 
        aiData.choices[0].message.content) {
      result = aiData.choices[0].message.content;
    } else {
      console.error("API返回数据格式异常:", JSON.stringify(aiData, null, 2));
      throw new Error("API返回数据格式异常");
    }
    
    res.json({ result });
    
  } catch (error) {
    console.error("AI API调用失败:", error.message);
    // 出错时返回模拟数据
    const mockTitles = generateMockTitles(topic);
    res.json({ 
      result: mockTitles,
      note: "（使用备用标题，API调用失败）"
    });
  }
});

// 生成模拟标题的函数
function generateMockTitles(topic) {
  const templates = [
    `🔥 必看！${topic}的5个隐藏技巧，99%的人不知道`,
    `😱 直到今天才发现${topic}的正确打开方式，太绝了！`,
    `💯 ${topic}天花板级别攻略，建议立即收藏！`,
    `✨ 亲测有效！${topic}这样做，效果翻倍`,
    `🚫 别再踩坑了！${topic}避雷指南，新手必看`,
    `📚 干货满满！${topic}新手入门到精通全攻略`,
    `💕 被问了100遍的${topic}秘诀，今天终于公开了`,
    `⚡️ 1分钟学会${topic}，小白也能秒变大神`,
    `💰 省下几千块！${topic}平替方案大公开`,
    `🎯 2026最新${topic}趋势，看完秒懂`,
    `🌟 ${topic}这样做，闺蜜都问我怎么做到的`,
    `💪 坚持一周${topic}，变化大到不敢相信`,
    `🤔 ${topic}的真相，原来我们都理解错了`,
    `🎁 偷偷告诉你${topic}的内部技巧，一般人我不说`,
    `✨ 神仙${topic}方法，从此告别烦恼`
  ];
  
  // 随机返回10个不同的标题
  const shuffled = [...templates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, 10).join('\n');
}

app.listen(3000, () => {
  console.log("✅ 服务器运行在 http://localhost:3000");
  console.log("📝 打开浏览器访问 http://localhost:3000");
  console.log("🤖 已配置DeepSeek API，正在使用AI生成标题\n");
});