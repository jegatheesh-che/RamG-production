// ================================================
// SECURE CLOUDINARY DELETION ENDPOINT
// Vercel Serverless Function (Node.js API)
// ================================================
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idToken, publicId } = req.body;

  if (!idToken || !publicId) {
    return res.status(400).json({ error: 'Missing idToken or publicId' });
  }

  try {
    // 1. VERIFY FIREBASE TOKEN USING GOOGLE IDENTITY TOOLKIT REST API
    // No firebase-admin or package.json needed.
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyDqr8ScyLi1v9SyRjBLJQ2PR3b2zCCaAuQ";
    
    const verifyResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const authData = await verifyResponse.json();

    if (authData.error || !authData.users || authData.users.length === 0) {
      console.error("[Auth Error] Invalid Token:", authData.error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const uid = authData.users[0].localId;

    // Must match the exact Admin UID defined in firestore.rules
    if (uid !== "Zks20I2RBLdxaa7qIu6jG1kS5CP2") {
      console.error("[Auth Error] Forbidden UID:", uid);
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // 2. CALL CLOUDINARY API TO DESTROY THE IMAGE
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dxbdobdxt";
    const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.error("[Cloudinary Error] API Key or Secret is missing in environment variables");
      return res.status(500).json({ error: 'Server configuration error: Cloudinary credentials missing' });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();

    // The string to sign must be alphabetically sorted parameters.
    // We only send public_id and timestamp.
    const strToSign = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    
    // Generate SHA-1 Signature securely on the server
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('signature', signature);

    const cloudResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      body: formData
    });

    const cloudData = await cloudResponse.json();

    // 'ok' means deleted, 'not found' means it was already deleted. Both are successful for our intent.
    if (cloudData.result === 'ok' || cloudData.result === 'not found') {
      return res.status(200).json({ success: true, result: cloudData.result });
    } else {
      console.error("[Cloudinary Error] Destroy failed:", cloudData);
      return res.status(400).json({ error: 'Cloudinary deletion failed', details: cloudData });
    }

  } catch (error) {
    console.error("[Server Error]", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
