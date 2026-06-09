/**
 * Vercel Serverless Function: /api/lc-proxy
 *
 * Proxies POST requests to https://leetcode.com/graphql from the server side.
 * This bypasses the browser CORS restriction — servers can call any URL freely.
 *
 * The frontend calls  /lc-graphql  →  vercel.json rewrites it here  →  leetcode.com
 */
export default async function handler(req, res) {
  // Only allow POST (GraphQL uses POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const upstream = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Appear to originate from leetcode.com so the API doesn't reject the request
        'Origin':  'https://leetcode.com',
        'Referer': 'https://leetcode.com/',
        'User-Agent': 'Mozilla/5.0 (compatible; DSA-Tracker/1.0)',
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();

    // Forward the response
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: `Proxy error: ${err.message}` });
  }
}
