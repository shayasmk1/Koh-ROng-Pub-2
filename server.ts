import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import crypto from "crypto";
import fetch from "node-fetch";
import FormData from "form-data";

// Helper function to format RSA Public Key if it was pasted as a single line
function formatPublicKey(key: string): string {
  // Remove all whitespace, newlines, and literal '\n' strings
  let cleanKey = key.replace(/\\n/g, '').replace(/\s+/g, '');
  
  // Find the header and footer
  const headerMatch = cleanKey.match(/-----BEGIN[A-Z\s]+-----/);
  const footerMatch = cleanKey.match(/-----END[A-Z\s]+-----/);
  
  if (headerMatch && footerMatch) {
    const headerStr = headerMatch[0];
    const footerStr = footerMatch[0];
    
    // Extract just the base64 body
    const body = cleanKey.substring(cleanKey.indexOf(headerStr) + headerStr.length, cleanKey.indexOf(footerStr));
    // Split into 64-character lines
    const bodyLines = body.match(/.{1,64}/g)?.join('\n') || body;
    // Rebuild the PEM format with proper newlines
    // Note: We reconstruct the header/footer with spaces instead of the stripped version
    const properHeader = headerStr.replace('BEGIN', 'BEGIN ').replace('KEY', ' KEY').replace('RSA ', 'RSA ');
    const properFooter = footerStr.replace('END', 'END ').replace('KEY', ' KEY').replace('RSA ', 'RSA ');
    
    // Actually, it's safer to just use standard headers if we know what it is, 
    // but let's just use the exact string they provided for the header/footer but with spaces restored
    let restoredHeader = "-----BEGIN PUBLIC KEY-----";
    let restoredFooter = "-----END PUBLIC KEY-----";
    
    if (cleanKey.includes("RSAPRIVATEKEY")) {
      restoredHeader = "-----BEGIN RSA PRIVATE KEY-----";
      restoredFooter = "-----END RSA PRIVATE KEY-----";
    } else if (cleanKey.includes("RSAPUBLICKEY")) {
      restoredHeader = "-----BEGIN RSA PUBLIC KEY-----";
      restoredFooter = "-----END RSA PUBLIC KEY-----";
    } else if (cleanKey.includes("PRIVATEKEY")) {
      restoredHeader = "-----BEGIN PRIVATE KEY-----";
      restoredFooter = "-----END PRIVATE KEY-----";
    }
    
    return `${restoredHeader}\n${bodyLines}\n${restoredFooter}\n`;
  }
  
  // Fallback if it doesn't match the expected format
  return key.replace(/\\n/g, '\n');
}

// Helper function to encrypt merchant_auth using RSA Public Key
function encryptMerchantAuth(source: string, publicKey: string): string {
  const maxLength = 117;
  let output = Buffer.alloc(0);
  let sourceBuffer = Buffer.from(source, 'utf8');

  while (sourceBuffer.length > 0) {
    const input = sourceBuffer.slice(0, maxLength);
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      input
    );
    output = Buffer.concat([output, encrypted]);
    sourceBuffer = sourceBuffer.slice(maxLength);
  }
  return output.toString('base64');
}

// Helper function to get UTC time in YYYYMMDDHHmmss format
function getReqTimeUtc(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ABA PayWay API endpoint
  const upload = multer();
  
  app.get("/api/test", (req, res) => {
    res.json({ status: "ok", message: "Server is reachable" });
  });

  app.post("/api/payway/create", upload.none(), async (req, res) => {
    console.log("Received PayWay create request:", req.body);
    const merchantId = process.env.ABA_PAYWAY_MERCHANT_ID;
    const apiKey = process.env.ABA_PAYWAY_API_KEY;
    const rsaPublicKey = process.env.ABA_PAYWAY_RSA_PUBLIC_KEY;

    try {
      let { amount, currency, title, description, payment_limit, return_url, merchant_ref_no } = req.body;
      
      // ALWAYS use UTC Time (Standard for APIs)
      const req_time = getReqTimeUtc();
      
      // Ensure merchant_ref_no is unique
      const unique_ref_no = `${merchant_ref_no}-${Date.now()}`;
      
      // Calculate expired_date on server (4 hours from now in UTC)
      const expDate = new Date(Date.now() + (4 * 60 * 60 * 1000));
      const expired_date = expDate.getUTCFullYear() + 
        String(expDate.getUTCMonth() + 1).padStart(2, "0") + 
        String(expDate.getUTCDate()).padStart(2, "0") + 
        String(expDate.getUTCHours()).padStart(2, "0") + 
        String(expDate.getUTCMinutes()).padStart(2, "0") + 
        String(expDate.getUTCSeconds()).padStart(2, "0");

      if (!merchantId || !apiKey || !rsaPublicKey) {
        console.error("Missing ABA PayWay credentials in environment variables.");
        return res.status(400).json({ 
          error: "Configuration Error",
          message: "ABA PayWay credentials (Merchant ID, API Key, or RSA Public Key) are missing from the server environment variables."
        });
      }
      
      // 1. Prepare merchant_auth JSON object
      const merchantAuthObj: any = {
        merchant_id: merchantId,
        merchant_ref_no: unique_ref_no,
        req_time: req_time,
        amount: amount,
        currency: currency || "USD",
        title: title || "Koh Rong Pub Crawl",
        description: description || "Tickets",
        expired_date: expired_date // Pass as string
      };
      
      if (return_url) merchantAuthObj.return_url = Buffer.from(return_url).toString('base64');
      if (payment_limit) merchantAuthObj.payment_limit = parseInt(payment_limit);
      if (expired_date) merchantAuthObj.expired_date = parseInt(expired_date);

      // 2. Encrypt merchant_auth with RSA Public Key
      const merchantAuthStr = JSON.stringify(merchantAuthObj);
      const formattedKey = formatPublicKey(rsaPublicKey);
      
      const merchantAuthEncrypted = encryptMerchantAuth(merchantAuthStr, formattedKey);

      // 3. Generate HMAC-SHA512 hash
      const b4hash = req_time + merchantId + merchantAuthEncrypted;
      const hash = req.body.wrong_hash ? "WRONG_HASH" : crypto.createHmac('sha512', apiKey).update(b4hash).digest('base64');
      
      const formData = new FormData();
      formData.append("req_time", req_time);
      formData.append("merchant_id", merchantId);
      formData.append("merchant_auth", merchantAuthEncrypted);
      formData.append("hash", hash);
      
      console.log("Sending request to ABA PayWay...");
      const response = await fetch("https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/payment-link/create", {
        method: "POST",
        body: formData as any,
        headers: formData.getHeaders()
      });
      
      const responseText = await response.text();
      console.log("ABA PayWay Response Status:", response.status);
      
      try {
        const data = JSON.parse(responseText);
        res.json(data);
      } catch (e) {
        console.error("ABA PayWay non-JSON response:", responseText);
        res.status(500).json({
          error: "Invalid response from ABA PayWay",
          details: responseText.substring(0, 500)
        });
      }
    } catch (error: any) {
      console.error("PayWay Create Error:", error);
      res.status(500).json({ 
        error: "Failed to create payment link", 
        details: error.message,
        stack: error.stack
      });
    }
  });

  app.post("/api/payway/detail", upload.none(), async (req, res) => {
    try {
      const { req_time, id } = req.body;
      
      const merchantId = process.env.ABA_PAYWAY_MERCHANT_ID;
      const apiKey = process.env.ABA_PAYWAY_API_KEY;
      const rsaPublicKey = process.env.ABA_PAYWAY_RSA_PUBLIC_KEY;

      if (!merchantId || !apiKey || !rsaPublicKey) {
        console.warn("Missing ABA PayWay credentials. Falling back to simulated detail.");
        res.json({ 
          simulated: true,
          status: "APPROVED",
          message: "Credentials not found. Simulating successful payment."
        });
        return;
      }

      // 1. Prepare merchant_auth JSON object
      const merchantAuthObj = {
        merchant_id: merchantId,
        req_time: req_time,
        id: id // This is the payment link ID returned from the create API
      };

      // 2. Encrypt merchant_auth with RSA Public Key
      const merchantAuthStr = JSON.stringify(merchantAuthObj);
      const formattedKey = formatPublicKey(rsaPublicKey);
      const merchantAuthEncrypted = encryptMerchantAuth(merchantAuthStr, formattedKey);
      console.log("merchantAuthEncrypted length:", merchantAuthEncrypted.length);

      // 3. Generate HMAC-SHA512 hash
      const b4hash = req_time + merchantId + merchantAuthEncrypted;
      const hash = crypto.createHmac('sha512', apiKey).update(b4hash).digest('base64');
      
      const formData = new FormData();
      formData.append("req_time", req_time);
      formData.append("merchant_id", merchantId);
      formData.append("merchant_auth", merchantAuthEncrypted);
      formData.append("hash", hash);
      
      const response = await fetch("https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/payment-link/detail", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      console.log("PayWay Detail Response:", data);
      res.json(data);
    } catch (error) {
      console.error("PayWay Detail Error:", error);
      res.status(500).json({ error: "Failed to get payment details" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
