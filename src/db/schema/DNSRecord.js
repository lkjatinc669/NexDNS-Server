import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Schema for storing DNS records.
 */
const DNSRecordSchema = new Schema(
  {
    // Domain name (e.g., example.com)
    name: {
      type: String,
      required: true,
      index: true,       // Index for fast queries
      lowercase: true,   // Normalize for consistency
      trim: true,
    },

    // DNS record types grouped under `data`
    data: {
      // A record (IPv4)
      A: {
        type: [String],
        default: [],
      },

      // AAAA record (IPv6)
      AAAA: {
        type: [String],
        default: [],
      },

      // CNAME record
      CNAME: {
        type: String,
        default: '',
      },

      // MX records (mail exchange)
      MX: {
        type: [
          {
            priority: { type: Number, required: true },
            exchange: { type: String, required: true },
          },
        ],
        default: [],
      },

      // NS records (name servers)
      NS: {
        type: [String],
        default: [],
      },

      // TXT records
      TXT: {
        type: [String],
        default: [],
      },

      // SRV records (service location)
      SRV: {
        type: [
          {
            priority: { type: Number, required: true },
            weight: { type: Number, required: true },
            port: { type: Number, required: true },
            target: { type: String, required: true },
          },
        ],
        default: [],
      },

      // PTR record (reverse DNS)
      PTR: {
        type: String,
        default: '',
      },

      // SOA record (start of authority)
      SOA: {
        type: new Schema(
          {
            primary: { type: String, required: true },      // Primary nameserver
            admin: { type: String, required: true },        // Admin email (format: hostmaster.domain.com)
            serial: {
              type: Number,
              default: () => {
                const now = new Date();
                // Format: YYYYMMDD01 for tracking changes
                return parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}01`);
              },
            },
            refresh: { type: Number, default: 3600 },       // Time before zone is refreshed (seconds)
            retry: { type: Number, default: 600 },          // Retry interval (seconds)
            expire: { type: Number, default: 604800 },      // Time before zone expires (seconds)
            minimum: { type: Number, default: 3600 },       // Minimum TTL (seconds)
          },
          { _id: false } // Avoid creating _id for nested SOA object
        ),
        default: undefined, // Optional field
      },
    },

    // Description for the DNS entry
    description: {
      type: String,
      default: '',
    },

    // Enable/disable this record
    enabled: {
      type: Boolean,
      default: true,
    },

    // Automatically managed by timestamps option
    createdAt: { type: Date, default: Date.now },
    lastUpdatedOn: { type: Date, default: Date.now },
  },

  {
    collection: 'dnsrecord',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'lastUpdatedOn',
    },
  }
);

// Register the model
const DNSRecordModel = mongoose.model('dnsrecord', DNSRecordSchema);
export default DNSRecordModel;