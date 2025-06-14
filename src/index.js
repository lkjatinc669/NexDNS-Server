// Import necessary modules
import dgram from "node:dgram";                          // UDP socket library for DNS server
import RequestProcessor from "./dns-server-utils/RequestProcessor.js"; // Handles DNS logic (blacklist, DB, fallback, etc.)
import connectToDB from "./db/connection/index.js";      // MongoDB connection utility

// Main function to start DNS server
const startDNSServer = async () => {
  try {
    // ✅ Ensure MongoDB is connected before starting server
    await connectToDB();

    // Create a UDP4 socket (IPv4 DNS)
    const server = dgram.createSocket('udp4');

    // Instantiate the DNS request handler
    const requestProcessor = new RequestProcessor();

    // 🔥 Handle fatal server errors (e.g., port already in use)
    server.on('error', (err) => {
      console.error('🔥 Server error:', err);
    });

    // 🚀 Log when server starts listening
    server.on('listening', () => {
      const { address, port } = server.address();
      console.log(`🚀 DNS Server running at ${address}:${port}`);
    });

    // 📩 Handle incoming DNS queries
    server.on('message', async (msg, rinfo) => {
      try {
        // Pass message to processor to build DNS response
        const response = await requestProcessor.getAnswer(msg);
        
        if (response) {
          // Send the response back to the client
          server.send(response, rinfo.port, rinfo.address, () => {
            console.log(`✅ Response sent to ${rinfo.address}:${rinfo.port}`);
          });
        } else {
          console.warn(`⚠️ No response generated for: ${rinfo.address}:${rinfo.port}`);
        }
      } catch (err) {
        console.error('❌ Failed to process DNS request:', err);
      }
    });

    // ✅ Finally, bind the server to port 5333 on all interfaces
    server.bind(5333, '0.0.0.0');
  } catch (err) {
    console.error('❌ Failed to start DNS server:', err);
  }
};

// 🔄 Start the DNS server
startDNSServer();