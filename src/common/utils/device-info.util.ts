// cài thư viet ua-parser-js để parse user-agent
// Import kiểu CommonJS, chứ import kiểu ESModule sẽ lỗi (const UAParser = require('ua-parser-js'); chứ ko phải import { UAParser } from 'ua-parser-js';)
export function getDeviceInfo(req: any) {
  const UAParser = require('ua-parser-js');
  const parser = new UAParser(req.headers['user-agent'] || '');
  const os = parser.getOS().name || 'unknown';
  const browser = parser.getBrowser().name || 'unknown';
  const deviceType = parser.getDevice().type || 'desktop'; // desktop, mobile, tablet
  const deviceInfo = `${os} - ${browser} (${deviceType})`;

  const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  return { deviceInfo, ipAddress, userAgent };
}
