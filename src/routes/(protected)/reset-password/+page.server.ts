// src\routes\(protected)\reset-password\+page.server.ts
import { generate, generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode'; // TypeScript now knows exactly what this is!

const currentStep = 2;
let temp;

export const load = async ({ locals }) => {
  console.log('genereate');
  const secret = generateSecret();
  const uri = generateURI({
    issuer: 'Naruto Mens Wear',
    label: 'Admin',
    secret,
  });

  clearInterval(temp);
  temp = setInterval(async () => {
    const token = await generate({ secret });
    const result = await verify({ secret, token });
    console.log(token, result);
  }, 1000);

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
      currentStep,
      authUser: locals.user,
    };
  } catch (err) {
    console.error('QR Generation failed:', err);
    return { status: 500 };
  }
};
