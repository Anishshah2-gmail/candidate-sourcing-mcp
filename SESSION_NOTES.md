# Candidate Sourcing MCP Server - Session Notes

**Last Updated:** December 3, 2025
**Status:** Ready for LinkedIn Talent API (Proxycurl shutdown)

---

## ⚠️ Important Update

**Proxycurl shut down on July 4, 2025** due to a LinkedIn lawsuit.

**Current path forward:** Get LinkedIn Talent Solutions API access through your company's LinkedIn admin.

---

## Repository

```
https://github.com/Anishshah2-gmail/candidate-sourcing-mcp
```

---

## Setup on a New Machine (Step-by-Step)

### Prerequisites
- macOS or Windows
- Node.js 18+ installed
- Claude Desktop installed
- LinkedIn Talent API credentials (from your company's LinkedIn admin)

### Steps

```bash
# Step 1: Install Homebrew (macOS only, if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Step 2: Install Node.js (if not installed)
brew install node

# Step 3: Verify Node.js installation
node --version  # Should show v18+ or higher
npm --version

# Step 4: Clone the repository
git clone https://github.com/Anishshah2-gmail/candidate-sourcing-mcp.git
cd candidate-sourcing-mcp

# Step 5: Install dependencies
npm install

# Step 6: Build the project
npm run build

# Step 7: Verify build succeeded
ls dist/index.js  # Should exist
```

### Step 8: Configure Claude Desktop

Create/edit the Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "candidate-sourcing": {
      "command": "node",
      "args": ["/full/path/to/candidate-sourcing-mcp/dist/index.js"],
      "env": {
        "DATA_PROVIDER": "linkedin",
        "LINKEDIN_CLIENT_ID": "your_client_id",
        "LINKEDIN_CLIENT_SECRET": "your_client_secret",
        "LINKEDIN_ACCESS_TOKEN": "your_access_token",
        "LINKEDIN_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

**Important:** Replace `/full/path/to/` with the actual path where you cloned the repo.

### Step 9: Restart Claude Desktop

Completely quit Claude Desktop (Cmd+Q on macOS) and reopen it.

### Step 10: Test

In Claude Desktop, try:
- "Check my provider status"
- "Search for 5 Senior Engineers in Bengaluru"

---

## What You Need from LinkedIn Admin

Contact your company's LinkedIn Talent Solutions administrator and ask for:

1. **Recruiter System Connect API access** (or similar Talent API)
2. **API Credentials:**
   - Client ID
   - Client Secret
   - Access Token
   - Refresh Token (optional but recommended)

**Questions to ask:**
> "Do we have API access to LinkedIn Recruiter System Connect or any LinkedIn Talent APIs? I need Client ID, Client Secret, and Access Token for a recruiting tool integration."

---

## Project Structure

```
candidate-sourcing-mcp/
├── src/
│   ├── index.ts                    # Main MCP server
│   ├── types/
│   │   ├── candidate.ts            # Candidate interfaces
│   │   └── provider.ts             # Provider interfaces
│   ├── services/
│   │   ├── provider-factory.ts     # Provider switching
│   │   ├── linkedin-api.ts         # LinkedIn API (active)
│   │   ├── proxycurl-api.ts        # Proxycurl (deprecated)
│   │   └── bookmark-store.ts       # Local bookmarks
│   └── tools/
│       ├── search-candidates.ts
│       ├── get-candidate-details.ts
│       ├── bookmark-candidates.ts
│       ├── export-candidates.ts
│       └── provider-status.ts
├── dist/                           # Compiled JS (after build)
├── package.json
├── tsconfig.json
└── README.md
```

---

## MCP Tools Available (9 total)

| Tool | Description |
|------|-------------|
| `linkedin_search_candidates` | Search with filters |
| `linkedin_get_candidate_details` | Full profile details |
| `bookmark_candidate` | Save with notes/tags |
| `remove_bookmark` | Remove bookmark |
| `list_bookmarks` | List all bookmarks |
| `update_bookmark` | Update notes/tags |
| `get_bookmark_tags` | Get all tags |
| `export_candidates` | Export JSON/CSV |
| `get_provider_status` | Check config status |

---

## Commands Reference

```bash
# Development
npm run dev        # Watch mode
npm run build      # Production build
npm run inspector  # Test with MCP Inspector

# Git
git pull           # Get latest changes
git status         # Check for changes
```

---

## Troubleshooting

**"Provider not configured"**
- Verify credentials in Claude Desktop config
- Check `DATA_PROVIDER` is set to `linkedin`
- Restart Claude Desktop

**"Cannot find module" error**
- Run `npm run build` again
- Check the path in Claude Desktop config is correct

**Changes not taking effect**
- Completely quit Claude Desktop (not just close window)
- Reopen Claude Desktop

---

## Next Steps

1. [ ] Get LinkedIn Talent API credentials from company admin
2. [ ] Update Claude Desktop config with real credentials
3. [ ] Restart Claude Desktop
4. [ ] Test with: "Check my provider status"
5. [ ] Test search: "Find 5 Senior Engineers in Bengaluru"
