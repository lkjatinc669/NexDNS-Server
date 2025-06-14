# NexDNS-Server

**NexDNS-Server** is a custom, local DNS server built using Node.js and MongoDB. It provides fine-grained DNS management, blacklisting, and fallback to external DNS providers.

## 🚀 Features

- 🧠 **Custom DNS Resolver** — Resolves A, AAAA, MX, CNAME, NS, TXT, PTR, SRV, SOA records from MongoDB.
- 🚫 **Blacklist Support** — Block DNS requests for specific domains.
- 🌐 **Fallback DNS** — Forwards to upstream resolvers if not found locally.
- 📥 **Batch Uploaders** — Easy-to-use CLI tools for uploading DNS records and blacklists.
- 🧾 **Detailed Logging** — Operation logs for each upload with timestamps.
- 🧪 **Built with ESM** — Fully written using native ES Modules.

## 📁 Project Structure

```bash
.
├── data/                      # Contains sample upload data (Update it for custom upload)
│   ├── black-list-uploader.js  # Blacklist domains
│   └── dns-record-uploader.js  # DNS record entries
├── src/
│   ├── consts/
│   │   └── FallbackData.js     # Hardcoded fallback DNS servers
│   ├── batch-uploaders-utils/
│   │   ├── BlackListUploader.js   # Script to upload blacklist data
│   │   └── DNSRecordUploader.js   # Script to upload DNS records
│   ├── db/
│   │   ├── connection/
│   │   │   └── index.js        # MongoDB connection setup
│   │   └── schema/
│   │       ├── BlackList.js    # Mongoose schema for blacklist entries
│   │       └── DNSRecord.js    # Mongoose schema for DNS records
│   ├── dns-server-utils/
│   │   └── RequestProcessor.js # Core logic to process and respond to DNS queries
│   ├── batch-uploader.js       # Entry script to handle bulk uploads from `data/*`
│   └── index.js                # Main DNS server script
├── package.json                # Project metadata and dependencies
└── Readme.md                   # Project documentation

```

## ⚙️ Setup

### 1. Clone the Repo
```bash
git clone https://github.com/lkjatinc669/NexDNS-Server.git
cd NexDNS-Server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment File
Create a `.env` file:

```env
MONGO_URI=mongodb://127.0.0.1:27017/NexDNS-Server
```

## 🔌 Usage

### Start DNS Server
```bash
npm run start
```

### Start in Dev Mode
```bash
npm run dev
```

### Upload DNS Records
```bash
# Save the DNS Records data to data/dns-record-uploader.js
npm run upload-dns-record
```

### Upload Blacklist
```bash
# Save the Blacklist data to data/dns-record-uploader.js
npm run upload-black-list
```

## 🔎 Example Data Format

### `data/dns-record-uploader.js`
```js
[
  {
    "name": "app.local.dev",
    "data": {
      "A": ["192.168.0.10", "192.168.0.11"],
      "AAAA": ["2001:db8:abcd:001::1", "2001:db8:abcd:001::2"],
      "CNAME": "app-backend.local.dev",
      "MX": [
        { "priority": 10, "exchange": "mail1.local.dev" },
        { "priority": 20, "exchange": "mail2.local.dev" }
      ],
      "NS": ["ns1.local.dev", "ns2.local.dev"],
      "TXT": ["v=spf1 include:local.dev ~all", "key=value"],
      "SRV": [
        {
          "priority": 1,
          "weight": 10,
          "port": 443,
          "target": "service.local.dev"
        },
        {
          "priority": 5,
          "weight": 5,
          "port": 8443,
          "target": "backup.local.dev"
        }
      ],
      "PTR": "10.0.168.192.in-addr.arpa",
      "SOA": {
        "primary": "ns1.local.dev",
        "admin": "admin.local.dev",
        "serial": 2025061201,
        "refresh": 3600,
        "retry": 600,
        "expire": 604800,
        "minimum": 3600
      }
    },
    "description": "DNS record for application service",
    "enabled": true,
    "createdAt": "2025-06-12T10:00:00.000Z",
    "lastUpdatedOn": "2025-06-12T10:00:00.000Z"
  },
  {
    // more data goes here
  }
]
```

### `data/black-list-uploader.js`
```js
[
  {
    "type": "domain",
    "value": "ads.example.com",
    "reason": "Ad domain",
    "enabled": true,
    "source": "manual",
    "tags": ["ads"]
  },
  {
    // more data goes here
  }
]
```

## 🧪 Testing

You can use `dig` or `nslookup` to test:

```bash
dig @127.0.0.1 -p 5333 example.com
```

## 📜 License

MIT License © 2025 Jatin Gohil
