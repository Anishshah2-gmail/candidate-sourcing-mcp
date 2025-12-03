# Candidate Sourcing MCP Server

An MCP (Model Context Protocol) server for LinkedIn-based candidate sourcing, designed to work with Claude Desktop.

## ⚠️ Important: Provider Status Update (July 2025)

**Proxycurl has shut down** due to a LinkedIn lawsuit (announced July 4, 2025).

**Current recommended approach:**
1. **LinkedIn Talent Solutions API** - Contact your company's LinkedIn admin for API access
2. **Alternative providers** - Bright Data, ScrapIn (see [Alternatives](#alternative-providers) section)

The multi-provider architecture allows easy switching when you have API access.

---

## Features

- **Multi-Provider Architecture** - Easily switch between data providers
- **LinkedIn Search** - Search candidates with filters (titles, skills, locations, experience, seniority, companies, industries)
- **Detailed Profiles** - Fetch full profile information for candidates
- **Bookmarks** - Save candidates with notes and tags for later review
- **Export** - Export candidates to JSON or CSV format

## Data Providers

| Provider | Status | Setup | Notes |
|----------|--------|-------|-------|
| **LinkedIn Talent API** | ✅ Recommended | Requires partnership | Contact your LinkedIn Talent Solutions admin |
| **Proxycurl** | ❌ Shutdown | N/A | Ceased operations July 2025 |
| **Bright Data** | 🔄 Can be added | API key | Alternative option |

## MCP Tools (9 total)

| Tool | Description |
|------|-------------|
| `linkedin_search_candidates` | Search for candidates with structured filters |
| `linkedin_get_candidate_details` | Get full profile details for a candidate |
| `bookmark_candidate` | Save a candidate with notes/tags |
| `remove_bookmark` | Remove from bookmarks |
| `list_bookmarks` | List all bookmarked candidates |
| `update_bookmark` | Update notes/tags |
| `get_bookmark_tags` | List all tags in use |
| `export_candidates` | Export to JSON/CSV |
| `get_provider_status` | Check provider configuration status |

## Installation

```bash
# Clone the repository
git clone https://github.com/Anishshah2-gmail/candidate-sourcing-mcp.git
cd candidate-sourcing-mcp

# Install dependencies
npm install

# Build
npm run build
```

## Configuration

### LinkedIn Talent Solutions API (Recommended)

> **Note:** Requires LinkedIn Recruiter System Connect API access through your company's LinkedIn partnership.

1. **Get LinkedIn API Credentials** from your LinkedIn Talent Solutions admin:
   - Client ID
   - Client Secret
   - Access Token
   - Refresh Token (optional)

2. **Configure Claude Desktop**

   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "candidate-sourcing": {
         "command": "node",
         "args": ["/path/to/candidate-sourcing-mcp/dist/index.js"],
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

3. **Restart Claude Desktop**

   Completely quit and reopen Claude Desktop for changes to take effect.

## Usage

Once configured, you can use natural language in Claude Desktop:

> "Find 20 Senior Backend Engineers in Bengaluru with 6-10 years experience, strong Java and microservices skills, preferably from FinTech companies"

Claude will:
1. Convert your request to structured search parameters
2. Call the MCP tools to search LinkedIn profiles
3. Present candidates in a recruiter-friendly format
4. Support refinements like "exclude FAANG" or "add Mumbai"

### Example Commands

```
"Search for Data Scientists in Mumbai with Python and ML experience"
"Show me details for candidate 3"
"Bookmark candidate 1 with tag 'shortlist'"
"Export all bookmarked candidates as CSV"
"What's my current provider status?"
```

## Architecture

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
│                         │                                    │
│                         ▼                                    │
│                  ┌────────────┐                             │
│                  │  LinkedIn  │                             │
│                  │ Talent API │                             │
│                  └────────────┘                             │
│           (More providers can be added)                     │
└─────────────────────────────────────────────────────────────┘
```

## Alternative Providers

If LinkedIn Talent API access is not available, these alternatives exist (implementation can be added):

| Provider | Website | Notes |
|----------|---------|-------|
| Bright Data | [brightdata.com](https://brightdata.com) | Largest, won court cases |
| ScrapIn | [scrapin.io](https://scrapin.io) | Real-time, no account needed |
| People Data Labs | [peopledatalabs.com](https://peopledatalabs.com) | Enrichment API |

⚠️ **Legal Note:** Third-party scraping services may face legal challenges from LinkedIn. Official LinkedIn API is the safest approach.

## Development

```bash
# Watch mode for development
npm run dev

# Test with MCP Inspector
npm run inspector

# Build for production
npm run build
```

## Adding a New Provider

The multi-provider architecture makes it easy to add new data sources:

1. Create a new service in `src/services/` implementing `IDataProvider` interface
2. Add the provider type to `src/types/provider.ts`
3. Update `src/services/provider-factory.ts` to include the new provider
4. Rebuild: `npm run build`

## Troubleshooting

**"Provider not configured" error:**
- Check that your API credentials are set in Claude Desktop config
- Verify the `DATA_PROVIDER` environment variable is set correctly
- Restart Claude Desktop after config changes

**"Rate limit exceeded":**
- Wait a few minutes before making more requests
- Consider reducing `page_size` in searches

**LinkedIn API errors:**
- Verify your access token is valid and not expired
- Check with your LinkedIn admin for API access status

## Setup on a New Machine

```bash
# 1. Install Node.js (if not installed)
# macOS with Homebrew:
brew install node

# 2. Clone the repository
git clone https://github.com/Anishshah2-gmail/candidate-sourcing-mcp.git
cd candidate-sourcing-mcp

# 3. Install and build
npm install
npm run build

# 4. Configure Claude Desktop (see Configuration section above)

# 5. Restart Claude Desktop
```

## License

MIT
