# Candidate Sourcing MCP Server - Session Notes

**Last Updated:** December 2, 2025
**Status:** Built and ready - pending LinkedIn API credentials

---

## What Was Built

A complete MCP (Model Context Protocol) server for LinkedIn-based candidate sourcing, designed to work with Claude Desktop.

### Project Location
```
/Users/anish/Projects/candidate-sourcing-mcp/
```

### MCP Tools Created (8 total)

| Tool | Purpose |
|------|---------|
| `linkedin_search_candidates` | Search LinkedIn with filters (titles, skills, locations, experience, seniority, companies, industries, keywords) |
| `linkedin_get_candidate_details` | Get full profile details for a specific candidate |
| `bookmark_candidate` | Save a candidate with notes and tags |
| `remove_bookmark` | Remove a candidate from bookmarks |
| `list_bookmarks` | List all bookmarked candidates (with filtering) |
| `update_bookmark` | Update notes/tags for a bookmarked candidate |
| `get_bookmark_tags` | Get all unique tags used in bookmarks |
| `export_candidates` | Export candidates to JSON or CSV format |

### Project Structure
```
candidate-sourcing-mcp/
├── src/
│   ├── index.ts                      # Main MCP server entry point
│   ├── types/
│   │   ├── candidate.ts              # TypeScript interfaces
│   │   └── index.ts
│   ├── services/
│   │   ├── linkedin-api.ts           # LinkedIn API integration
│   │   └── bookmark-store.ts         # Local file-based bookmark storage
│   └── tools/
│       ├── search-candidates.ts      # linkedin_search_candidates tool
│       ├── get-candidate-details.ts  # linkedin_get_candidate_details tool
│       ├── bookmark-candidates.ts    # All bookmark-related tools
│       ├── export-candidates.ts      # export_candidates tool
│       └── index.ts
├── dist/                             # Compiled JavaScript (ready to run)
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

---

## What's Pending

### 1. LinkedIn API Credentials

You need **actual LinkedIn API credentials**, NOT login email/password.

**Required credentials:**
- `LINKEDIN_CLIENT_ID` - Alphanumeric string from LinkedIn Developer Portal
- `LINKEDIN_CLIENT_SECRET` - Alphanumeric string from LinkedIn Developer Portal
- `LINKEDIN_ACCESS_TOKEN` - OAuth token (long JWT string)
- `LINKEDIN_REFRESH_TOKEN` - (Optional) For auto-refreshing expired tokens

**How to get these:**
1. Go to https://www.linkedin.com/developers/
2. Create an app or access existing app
3. Get Client ID and Client Secret from app settings
4. Generate Access Token via OAuth 2.0 flow

**OR** contact your RIL LinkedIn Talent Solutions admin - they may already have API access configured.

### 2. Update Claude Desktop Config

Once you have credentials, update this file:
```
/Users/anish/Library/Application Support/Claude/claude_desktop_config.json
```

Replace the placeholder values:
```json
{
  "mcpServers": {
    "candidate-sourcing": {
      "command": "node",
      "args": ["/Users/anish/Projects/candidate-sourcing-mcp/dist/index.js"],
      "env": {
        "LINKEDIN_CLIENT_ID": "your_actual_client_id",
        "LINKEDIN_CLIENT_SECRET": "your_actual_client_secret",
        "LINKEDIN_ACCESS_TOKEN": "your_actual_access_token",
        "LINKEDIN_REFRESH_TOKEN": "your_actual_refresh_token"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

After adding credentials, completely quit and reopen Claude Desktop for changes to take effect.

---

## Commands Reference

```bash
# Navigate to project
cd /Users/anish/Projects/candidate-sourcing-mcp

# Rebuild after any code changes
npm run build

# Test the server manually (will show errors if credentials missing)
node dist/index.js

# Watch mode for development
npm run dev

# Test with MCP Inspector (debugging tool)
npm run inspector
```

---

## System Prompt for Claude Desktop

The full recruiter-focused system prompt was provided in the original conversation. Key points:

- Claude acts as a recruiter-focused candidate sourcing assistant
- Converts natural language JDs into structured searches
- Presents candidates in recruiter-friendly format
- Supports iterative refinement ("more senior", "exclude FAANG", etc.)
- Can show detailed profiles on request
- Handles bookmarking and export

---

## Next Session Checklist

- [ ] Get LinkedIn API credentials (Client ID, Secret, Access Token)
- [ ] Update `/Users/anish/Library/Application Support/Claude/claude_desktop_config.json`
- [ ] Restart Claude Desktop
- [ ] Test with a sample search
- [ ] (Optional) Add the recruiter system prompt to a Claude Desktop Project

---

## Alternative: Proxycurl Fallback

If LinkedIn Talent Solutions API is difficult to obtain, we discussed **Proxycurl** as an alternative:
- Works with any LinkedIn profile URL
- ~$0.01-0.03 per profile lookup
- Much easier setup
- Can be swapped in later

Let me know in the next session if you want to pivot to Proxycurl instead.
