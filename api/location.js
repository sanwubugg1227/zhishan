// 必须放在项目根目录的 api 文件夹下：api/location.js
export default async function handler(req, res) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 从 Vercel 的环境变量中安全读取高德 Key
    const amapKey = process.env.AMAP_KEY; 

    if (!amapKey) {
      return res.status(500).json({ error: 'AMAP Key not configured on Vercel' });
    }
    
    // 获取用户的真实 IP（Vercel 会自动放在请求头里，如果没有则尝试获取直连 IP）
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

    // 如果获取不到真实 IP（比如本地开发环境），高德 API 默认会根据请求发出的服务器定位
    const ipParam = clientIp ? `&ip=${clientIp.split(',')[0].trim()}` : '';

    const response = await fetch(`https://restapi.amap.com/v3/ip?key=${amapKey}${ipParam}`);
    
    if (!response.ok) {
       return res.status(response.status).json({ error: '高德 API 请求失败' });
    }

    const data = await response.json();

    if (data.status === "1") {
      // 高德返回成功
      // 注意：如果是直辖市，高德的 city 字段可能是个空数组，此时取 province 即可
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