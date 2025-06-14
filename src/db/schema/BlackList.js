import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Schema for managing blacklisted domains/IPs in the DNS server.
 */
const BlackListSchema = new Schema(
  {
    // Type of entry: domain or IP address
    type: {
      type: String,
      enum: ['domain', 'ip'],
      required: true,
      default: 'domain',
    },

    // Value of the domain or IP being blacklisted
    value: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // ensure case-insensitive matching
    },

    // Optional reason for blacklisting
    reason: {
      type: String,
      default: 'No reason specified',
    },

    // If disabled, the blacklist record is ignored
    enabled: {
      type: Boolean,
      default: true,
    },

    // Source of entry: manual, automatic, or external feed
    source: {
      type: String,
      default: 'manual',
      enum: ['manual', 'auto', 'external-feed'],
    },

    // Optional tags for categorizing blacklist (e.g., ads, phishing)
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    collection: 'blacklist',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

const BlackListModel = mongoose.model('Blacklist', BlackListSchema);
export default BlackListModel;