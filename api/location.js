// 文件路径：api/location.js
export default async function handler(req, res) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 从 Vercel 的环境变量中安全读取高德 Key（必须是 Web服务 类型的 Key）
    const amapKey = process.env.AMAP_KEY; 

    if (!amapKey) {
      return res.status(500).json({ error: 'AMAP Key not configured on Vercel' });
    }
    
    // 获取用户的真实 IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const ipParam = clientIp ? `&ip=${clientIp.split(',')[0].trim()}` : '';

    // 直接请求高德 IP 定位服务
    const response = await fetch(`https://restapi.amap.com/v3/ip?key=${amapKey}${ipParam}`);
    
    if (!response.ok) {
       return res.status(response.status).json({ error: '高德 API 请求失败' });
    }

    const data = await response.json();

    if (data.status === "1") {
      // 提取省市信息，兼容直辖市的情况
      const cityName = (typeof data.city === 'string' && data.city) ? data.city : data.province;
      
      return res.status(200).json({
        city: cityName || "",
        region: data.province || "",
        country: "中国",
      });
    } else {
      return res.status(400).json({ error: data.info || "获取位置失败" });
    }
  } catch (error) {
    console.error("Location Server Error:", error);
    return res.status(500).json({ error: "内部定位服务错误" });
  }
}