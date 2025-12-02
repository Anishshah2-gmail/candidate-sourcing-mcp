# Candidate Sourcing MCP Server - Session Notes

**Last Updated:** December 3, 2025
**Status:** Ready to use with Proxycurl (recommended) or LinkedIn Talent API

---

## What Was Built

A complete MCP server for LinkedIn-based candidate sourcing with **multi-provider architecture**.

### Repository
```
https://github.com/Anishshah2-gmail/candidate-sourcing-mcp
```

### Project Location (Local)
```
/Users/anish/Projects/candidate-sourcing-mcp/
```

---

## Architecture: Multi-Provider Support

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Desktop                            │
└─────────────────────────┬───────────────────────────────────┘
                          │ MCP Protocol
┌─────────────────────────▼───────────────────────────────────┐
│              Candidate Sourcing MCP Server                   │
├─────────────────────────────────────────────────────────────┤
│  Tools: search, details, bookmark, export, status           │
├─────────────────────────────────────────────────────────────┤
│                   Provider Factory                           │
│         ┌──────────────┴──────────────┐                     │
│         ▼                              ▼                     │
│   ┌──────────┐                  ┌────────────┐              │
│   │Proxycurl │ (default)        │  LinkedIn  │              │
│   │  API     │                  │ Talent API │              │
│   └──────────┘                  └────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Provider Comparison

| Provider | Setup | Cost | Best For |
|----------|-------|------|----------|
| **Proxycurl** | API key only | ~$0.01-0.03/profile | Quick start, most users |
| **LinkedIn Talent API** | Partnership required | Enterprise | Existing LinkedIn partnership |

---

## MCP Tools (9 total)

| Tool | Description |
|------|-------------|
| `linkedin_search_candidates` | Search with filters (titles, skills, locations, experience, seniority, companies) |
| `linkedin_get_candidate_details` | Get full profile with work history, education, skills |
| `bookmark_candidate` | Save candidate with notes and tags |
| `remove_bookmark` | Remove from bookmarks |
| `list_bookmarks` | List all bookmarked candidates |
| `update_bookmark` | Update notes/tags |
| `get_bookmark_tags` | Get all unique tags |
| `export_candidates` | Export to JSON or CSV |
| `get_provider_status` | Check provider config and credit balance |

---

## Quick Start with Proxycurl

### 1. Get Proxycurl API Key
- Sign up: https://nubela.co/proxycurl
- Free tier available for testing
- Pay-as-you-go pricing

### 2. Clone and Build
```bash
git clone https://github.com/Anishshah2-gmail/candidate-sourcing-mcp.git
cd candidate-sourcing-mcp
npm install
npm run build
```

### 3. Configure Claude Desktop

**File:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "candidate-sourcing": {
      "command": "node",
      "args": ["/path/to/candidate-sourcing-mcp/dist/index.js"],
      "env": {
        "DATA_PROVIDER": "proxycurl",
        "PROXYCURL_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

---

## Proxycurl Credit Costs

| Operation | Credits | Notes |
|-----------|---------|-------|
| Person Search | 3/result | Includes enriched profile data |
| Profile Details | 1 | Full profile with work history |
| Role Lookup | 3 | Find person by role at company |
| Person Lookup | 2 | Find by name and company |

**Pricing tiers:**
- Pay-as-you-go: $0.018-0.020/credit
- Monthly plans: $0.009-0.020/credit
- Enterprise: Custom pricing

---

## Switching to LinkedIn Talent API (Future)

When you get LinkedIn Talent API access:

1. Update Claude Desktop config:
```json
{
  "env": {
    "DATA_PROVIDER": "linkedin",
    "LINKEDIN_CLIENT_ID": "your_client_id",
    "LINKEDIN_CLIENT_SECRET": "your_client_secret",
    "LINKEDIN_ACCESS_TOKEN": "your_access_token",
    "LINKEDIN_REFRESH_TOKEN": "your_refresh_token"
  }
}
```

2. Restart Claude Desktop

The same tools work with both providers - no code changes needed.

---

## Files Structure

```
candidate-sourcing-mcp/
├── src/
│   ├── index.ts                      # Main MCP server
│   ├── types/
│   │   ├── candidate.ts              # Candidate interfaces
│   │   └── provider.ts               # Provider interfaces
│   ├── services/
│   │   ├── provider-factory.ts       # Provider switching logic
│   │   ├── proxycurl-api.ts          # Proxycurl implementation
│   │   ├── linkedin-api.ts           # LinkedIn API implementation
│   │   └── bookmark-store.ts         # Local bookmark storage
│   └── tools/
│       ├── search-candidates.ts
│       ├── get-candidate-details.ts
│       ├── bookmark-candidates.ts
│       ├── export-candidates.ts
│       └── provider-status.ts
├── dist/                             # Compiled JavaScript
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Next Session Checklist

- [ ] Sign up for Proxycurl at https://nubela.co/proxycurl
- [ ] Get API key from Proxycurl dashboard
- [ ] Update Claude Desktop config with API key
- [ ] Restart Claude Desktop
- [ ] Test with: "Check my provider status"
- [ ] Test search: "Find 5 Senior Engineers in Bengaluru"

---

## Commands Reference

```bash
# Clone from any device
git clone https://github.com/Anishshah2-gmail/candidate-sourcing-mcp.git

# Install and build
cd candidate-sourcing-mcp
npm install
npm run build

# Development
npm run dev        # Watch mode
npm run inspector  # Test with MCP Inspector
```

---

## Troubleshooting

**Provider not configured:**
- Verify API key in Claude Desktop config
- Check spelling of environment variable names
- Restart Claude Desktop

**Rate limit exceeded:**
- Wait before making more requests
- Reduce page_size in searches

**Search returns no results:**
- Try broader search criteria
- Check if location format is correct (e.g., "Bengaluru, India")
