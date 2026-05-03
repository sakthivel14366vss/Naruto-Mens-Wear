// src\routes\(protected)\reset-password\+page.server.ts
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode'; // TypeScript now knows exactly what this is!

export const load = async () => {
  const secret = generateSecret();
  const uri = generateURI({
    issuer: 'Naruto Mens Wear',
    label: 'Admin',
    secret,
  });

  try {
    const qrCodeUrl = await QRCode.toDataURL(uri, {
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return {
      qrCodeUrl,
      secret,
    };
  } catch (err) {
    console.error('QR Generation failed:', err);
    return { status: 500 };
  }
};
