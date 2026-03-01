export default async function handler(req, res) {
  // 1. 允许跨域 (解决 CORS 报错的关键)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Notion-Version, X-Notion-Target-Url');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. 从请求头中获取真正的 Notion API 地址
  const targetUrl = req.headers['x-notion-target-url'];
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target URL in headers' });
  }

  // 3. 提取其他头部信息 (Authorization, Content-Type 等)
  const forwardHeaders = {};
  if (req.headers.authorization) forwardHeaders['Authorization'] = req.headers.authorization;
  if (req.headers['notion-version']) forwardHeaders['Notion-Version'] = req.headers['notion-version'];
  if (req.headers['content-type']) forwardHeaders['Content-Type'] = req.headers['content-type'];

  try {
    // 4. 转发请求到 Notion
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();
    
    // 5. 将结果返回给前端
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}