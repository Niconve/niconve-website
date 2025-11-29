// User Agent Parser untuk Analytics
import UAParser from 'ua-parser-js';

export function parseUserAgent(userAgentString) {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  
  return {
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || '',
    device: result.device.type || 'desktop',
    deviceVendor: result.device.vendor || '',
    deviceModel: result.device.model || ''
  };
}

export function getDeviceType(userAgentString) {
  const parser = new UAParser(userAgentString);
  const device = parser.getDevice();
  
  if (device.type === 'mobile') return 'mobile';
  if (device.type === 'tablet') return 'tablet';
  return 'desktop';
}
