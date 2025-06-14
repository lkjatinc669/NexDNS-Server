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
    "name": "media.local.dev",
    "data": {
      "A": ["192.168.0.21"],
      "AAAA": ["2001:db8:abcd:002::1"],
      "CNAME": "cdn.local.dev",
      "MX": [
        { "priority": 5, "exchange": "mail.media.local.dev" }
      ],
      "NS": ["ns1.media.local.dev"],
      "TXT": ["v=spf1 mx -all"],
      "SRV": [
        {
          "priority": 0,
          "weight": 100,
          "port": 1935,
          "target": "stream.media.local.dev"
        }
      ],
      "PTR": "21.0.168.192.in-addr.arpa",
      "SOA": {
        "primary": "ns1.media.local.dev",
        "admin": "hostmaster.media.local.dev",
        "serial": 2025061202,
        "refresh": 7200,
        "retry": 900,
        "expire": 1209600,
        "minimum": 3600
      }
    },
    "description": "DNS record for media streaming services",
    "enabled": true,
    "createdAt": "2025-06-12T11:00:00.000Z",
    "lastUpdatedOn": "2025-06-12T11:00:00.000Z"
  }
]
