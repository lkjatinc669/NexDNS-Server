// Imports
import dnsPacket from 'dns-packet'; // For encoding/decoding DNS messages
import dgram from 'node:dgram';     // UDP socket handling
import DNSRecordModel from '../db/schema/DNSRecord.js'; // MongoDB model for DNS records
import BlackListModel from '../db/schema/BlackList.js'; // MongoDB model for blacklisted domains
import fallbackData from '../consts/FallbackData.js';   // Static list of fallback DNS servers

export default class RequestProcessor {
  constructor() { }

  // Entry point: handle DNS request and return a DNS response buffer
  async getAnswer(messageBuffer) {
    const incomingReq = dnsPacket.decode(messageBuffer);   // Decode the incoming DNS message
    const question = this.#fetchQuestion(incomingReq);     // Extract the first DNS question
    const { name, type } = question;

    // 1. Check if the domain is blacklisted
    const isBlocked = await this.#searchBlackList(name);
    if (isBlocked) {
      return this.#generateBlockedResponse(incomingReq, question);
    }

    // 2. Check if the domain is available in the local database
    const records = await this.#searchDataBase(name, type);
    if (records) {
      return this.#generateAnswer(incomingReq, question, records);
    }

    // 3. If not in DB, use fallback DNS resolvers
    const fallbackResponse = await this.#handleFallBack(name, type, incomingReq.id);
    if (fallbackResponse) return fallbackResponse;

    // 4. If all else fails, return an empty NXDOMAIN response
    return this.#generateEmptyResponse(incomingReq, question);
  }

  // Extracts the DNS question (only handles the first one)
  #fetchQuestion(decodedPacket) {
    return decodedPacket.questions[0];
  }

  // Searches MongoDB for a blacklist match
  async #searchBlackList(domain) {
    const data = await BlackListModel.findOne({ value: domain.toLowerCase(), enabled: true });
    return !!data; // Returns true if found
  }

  // Searches local DNS database
  async #searchDataBase(domain, recordType) {
    const entry = await DNSRecordModel.findOne({ name: domain.toLowerCase(), enabled: true });
    if (!entry) return null;

    const records = entry.data?.[recordType];
    if (!records) return null;

    // If record is array (e.g., multiple A records)
    if (Array.isArray(records)) {
      return records.map((r) => ({
        type: recordType,
        class: 'IN',
        name: domain,
        ttl: 300,
        data: r,
      }));
    } 
    // If object (e.g., MX, SRV, SOA)
    else if (typeof records === 'object') {
      return [{
        type: recordType,
        class: 'IN',
        name: domain,
        ttl: 300,
        data: records,
      }];
    } 
    // Single string record
    else {
      return [{
        type: recordType,
        class: 'IN',
        name: domain,
        ttl: 300,
        data: records,
      }];
    }
  }

  // Constructs a DNS answer packet using local DB records
  #generateAnswer(incomingReq, question, answers) {
    return dnsPacket.encode({
      type: 'response',
      id: incomingReq.id,
      flags: dnsPacket.AUTHORITATIVE_ANSWER, // Indicates authoritative response
      questions: [question],
      answers: answers,
    });
  }

  // Constructs an NXDOMAIN response (domain not found)
  #generateEmptyResponse(incomingReq, question) {
    return dnsPacket.encode({
      type: 'response',
      id: incomingReq.id,
      flags: dnsPacket.RECURSION_DESIRED | dnsPacket.RECURSION_AVAILABLE,
      questions: [question],
      answers: [],
      rcode: 'NXDOMAIN', // DNS error code: Non-Existent Domain
    });
  }

  // Constructs a DNS response for blacklisted domains
  #generateBlockedResponse(incomingReq, question) {
    return dnsPacket.encode({
      type: 'response',
      id: incomingReq.id,
      flags: dnsPacket.AUTHORITATIVE_ANSWER,
      questions: [question],
      answers: [{
        type: 'TXT',               // TXT record to show a custom message
        class: 'IN',
        name: question.name,
        ttl: 60,
        data: 'Blocked by local DNS server',
      }],
    });
  }

  // Fallback to external DNS servers if local DB misses
  async #handleFallBack(domain, type, originalId) {
    for (const key of Object.keys(fallbackData)) {
      const fallback = fallbackData[key];
      if (!fallback?.ip || !fallback?.port) continue;

      const fallbackId = Math.floor(Math.random() * 65535); // Random ID for external request
      const msg = dnsPacket.encode({
        type: 'query',
        id: fallbackId,
        flags: dnsPacket.RECURSION_DESIRED,
        questions: [{
          type,
          class: 'IN',
          name: domain,
        }],
      });

      try {
        const responseBuffer = await this.#udpQuery(fallback.ip, fallback.port, msg);
        const response = dnsPacket.decode(responseBuffer);

        // Overwrite fallback response ID with original request ID
        response.id = originalId;
        return dnsPacket.encode(response);
      } catch (err) {
        console.warn(`⚠️ Fallback failed for ${fallback.ip}:${fallback.port} → ${err.message}`);
      }
    }

    // If all fallback resolvers failed
    console.warn(`❌ All fallback DNS servers failed for: ${domain}`);
    return null;
  }

  // Sends UDP DNS request and waits for response
  async #udpQuery(ip, port, message) {
    return new Promise((resolve, reject) => {
      const socket = dgram.createSocket('udp4');
      let handled = false;

      // Cleanup logic for both success and failure
      const cleanUp = () => {
        if (!handled) {
          handled = true;
          socket.close();
        }
      };

      // Send message
      socket.send(message, port, ip, (err) => {
        if (err) {
          cleanUp();
          return reject(err);
        }
      });

      // Receive response
      socket.once('message', (response) => {
        cleanUp();
        resolve(response);
      });

      // Error handler
      socket.once('error', (err) => {
        cleanUp();
        reject(err);
      });

      // Timeout if no response in 2 seconds
      setTimeout(() => {
        cleanUp();
        reject(new Error('UDP query timeout'));
      }, 2000);
    });
  }
}
