import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function test() {
  try {
    const url = await client.mutation("items:generateUploadUrl");
    console.log("Upload URL:", url);
    
    // Simulate File Upload
    const blob = new Blob(["hello"], { type: "text/plain" });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: blob
    });
    console.log("Post status:", res.status);
    const result = await res.json();
    console.log("Result:", result);
    
    const fileUrl = await client.mutation("items:getUploadUrl", { storageId: result.storageId });
    console.log("File URL:", fileUrl);
  } catch(e) {
    console.error("FAIL:", e);
  }
}
test();
