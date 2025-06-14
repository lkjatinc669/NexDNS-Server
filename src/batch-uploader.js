import ArgParser from 'node-arg-parser';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

import BlackListUploader from './db/operations/batch-uploaders-utils/BlackListUploader.js';
import DNSRecordUploader from './db/operations/batch-uploaders-utils/DNSRecordUploader.js';
import connectToDB from './db/connection/index.js'; // MongoDB connection

// ---------------------------
// CLI Argument Setup
// ---------------------------
const parser = new ArgParser();

parser
  .add('-ut', '--upload-type')
  .acceptType(String)
  .setDescription('Set type to dnsrecord, blacklist or constsdata based on your upload type')
  .required(true);

parser
  .add('-jf', '--json-file')
  .acceptType(String)
  .setDescription('Path for JSON File. Try entering full path')
  .required(true);

// Parse arguments
const finalData = parser.parse();

// ---------------------------
// Main Execution
// ---------------------------
async function checkAndUpload() {
  const filePath = path.resolve(finalData['json-file']);
  const uploadType = finalData['upload-type'];

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  // Read and parse the JSON
  let data;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('Top-level structure must be an array');
  } catch (err) {
    console.error('❌ Failed to parse JSON:', err.message);
    return;
  }

  // Connect to MongoDB
  try {
    await connectToDB();
  } catch (err) {
    console.error('❌ DB connection failed. Aborting...');
    return;
  }

  // Determine uploader function based on type
  try {
    if (uploadType === 'dnsrecord') {
      await DNSRecordUploader(data);
    } else if (uploadType === 'blacklist') {
      await BlackListUploader(data);
    } else {
      console.error('❌ Invalid upload type. Use "dnsrecord" or "blacklist".');
    }
  } catch (err) {
    console.error(`❌ Upload failed: ${err.message}`);
  } finally {
    // Gracefully close DB connection
    await mongoose.disconnect();
    console.log('📦 MongoDB connection closed.');
  }
}

// ---------------------------
// Start Process
// ---------------------------
checkAndUpload();

