import DNSRecordModel from '../../schema/DNSRecord.js';
import fs from 'fs';
import path from 'path';

/**
 * Upload or update DNS records in the database
 * @param {Array} data - Array of DNS record objects
 */
export default async function DNSRecordUploader(data) {
  if (!Array.isArray(data)) {
    console.error('❌ DNS data must be an array.');
    return;
  }

  const log = [];

  for (const record of data) {
    try {
      // Insert or update DNS record based on domain name
      const updated = await DNSRecordModel.findOneAndUpdate(
        { name: record.name.toLowerCase() },           // Match domain
        { ...record, name: record.name.toLowerCase(), lastUpdatedOn: new Date() }, // Update with timestamp
        { upsert: true, new: true }                     // Insert if not found
      );

      log.push({ name: record.name, status: '✅ Inserted/Updated' });
    } catch (err) {
      log.push({ name: record.name, status: '❌ Failed', error: err.message });
    }
  }

  writeLog('dnsrecord', log);
  console.log(`📝 DNS record operation complete. Log saved.`);
}

/**
 * Write operation logs to file
 * @param {string} type - Log file prefix
 * @param {Array} logData - Array of log entries
 */
function writeLog(type, logData) {
  const dir = path.resolve('logs');

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const file = path.join(dir, `${type}-${Date.now()}.log`);

  const logText = logData.map(
    l => `${l.name}: ${l.status}${l.error ? ` - ${l.error}` : ''}`
  ).join('\n');

  fs.writeFileSync(file, logText);
}