export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Only POST allowed', { status: 405 });
    }

    const { public_id } = await request.json();
    if (!public_id) {
      return new Response('Missing public_id', { status: 400 });
    }

    const cloudName = ENV.CLOUDINARY_CLOUD_NAME;
    const apiKey = ENV.CLOUDINARY_API_KEY;
    const apiSecret = ENV.CLOUDINARY_API_SECRET;

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
    const signature = await sha1(stringToSign);

    const formData = new URLSearchParams();
    formData.append('public_id', public_id);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.text();
    return new Response(result, { status: response.status });
  },
};

async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

declare const ENV: {
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
};
