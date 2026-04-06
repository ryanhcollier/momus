require('dotenv').config({ path: '.env.local' });
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function test() {
  try {
    const url = await client.mutation("items:generateUploadUrl");
    console.log("Upload URL generated:", url);
    
    // Create a mock file (Buffer)
    const buffer = Buffer.from("hello world");
    const res = await fetch(url, {
      method: 'POST', 
      headers: { 'Content-Type': 'text/plain' },
      body: buffer
    });
    
    console.log("Fetch Status:", res.status);
    const data = await res.json();
    console.log("Storage ID:", data.storageId);
    
    const fileUrl = await client.mutation("items:getUploadUrl", { storageId: data.storageId });
    console.log("Resolved file URL:", fileUrl);
  } catch (err) {
    console.error("FAILED:", err);
  }
}
test();
