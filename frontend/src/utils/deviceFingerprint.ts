import FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * Generate a unique device fingerprint combining FingerprintJS and browser info
 * This will be used for device verification by admin
 */
export const generateDeviceFingerprint = async (): Promise<string> => {
  try {
    // Initialize FingerprintJS
    const fp = await FingerprintJS.load();
    const result = await fp.get();

    // Get additional browser information
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      visitorId: result.visitorId,
    };

    // Create a composite fingerprint
    const fingerprintData = JSON.stringify(browserInfo);

    // Generate a hash-like string (in production, backend should validate this)
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store the device ID in localStorage for consistency
    localStorage.setItem('deviceId', hashHex);

    return hashHex;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);

    // Fallback: generate a UUID and store it
    const fallbackId = crypto.randomUUID();
    localStorage.setItem('deviceId', fallbackId);
    return fallbackId;
  }
};

/**
 * Get stored device ID or generate a new one
 */
export const getDeviceId = async (): Promise<string> => {
  const storedId = localStorage.getItem('deviceId');

  if (storedId) {
    return storedId;
  }

  return await generateDeviceFingerprint();
};

/**
 * Get device information for display/debugging
 */
export const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};
