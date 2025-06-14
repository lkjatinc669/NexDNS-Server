import BlackListModel from '../db/schema/BlackList.js';
import fs from 'fs';
import path from 'path';

/**
 * Uploads or updates blacklist entries in the database
 * @param {Array} data - Array of blacklist objects
 */
export default async function BlackListUploader(data) {
  if (!Array.isArray(data)) {
    console.error('❌ Blacklist data must be an array.');
    return;
  }

  const log = [];

  for (const entry of data) {
    try {
      // Normalize the value (e.g., domain names to lowercase)
      const normalizedValue = entry.value.toLowerCase();

      // Insert or update entry
      const updated = await BlackListModel.findOneAndUpdate(
        { value: normalizedValue },
        { ...entry, value: normalizedValue },
        { upsert: true, new: true }
      );

      log.push({ value: entry.value, status: '✅ Inserted/Updated' });
    } catch (err) {
      log.push({ value: entry.value, status: '❌ Failed', error: err.message });
    }
  }

  writeLog('blacklist', log);
  console.log(`📝 Blacklist operation complete. Log saved.`);
}

/**
 * Write blacklist upload log to file
 * @param {string} type - Log type name (used in filename)
 * @param {Array} logData - Log entries
 */
function writeLog(type, logData) {
  const dir = path.resolve('logs');

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const file = path.join(dir, `${type}-${Date.now()}.log`);
  const logText = logData.map(
    l => `${l.value}: ${l.status}${l.error ? ` - ${l.error}` : ''}`
  ).join('\n');

  fs.writeFileSync(file, logText);
}