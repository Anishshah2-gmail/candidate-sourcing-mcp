# Candidate Sourcing MCP Server

An MCP (Model Context Protocol) server for LinkedIn-based candidate sourcing, designed to work with Claude Desktop.

## Features

- **Multi-Provider Support** - Switch between Proxycurl (recommended) and LinkedIn Talent API
- **LinkedIn Search** - Search candidates with filters (titles, skills, locations, experience, seniority, companies, industries)
- **Detailed Profiles** - Fetch full profile information for candidates
- **Bookmarks** - Save candidates with notes and tags for later review
- **Export** - Export candidates to JSON or CSV format

## Data Providers

| Provider | Best For | Setup Difficulty | Cost |
|----------|----------|------------------|------|
| **Proxycurl** (Default) | Quick start, most users | Easy - just API key | ~$0.01-0.03/profile |
| **LinkedIn Talent API** | Enterprise, existing partnership | Hard - requires LinkedIn partnership | Enterprise pricing |

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

### Option A: Proxycurl (Recommended - Quick Start)

1. **Get Proxycurl API Key**
   - Sign up at [https://nubela.co/proxycurl](https://nubela.co/proxycurl)
   - Free tier available for testing
   - Pay-as-you-go: ~$0.01-0.03 per profile

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
           "DATA_PROVIDER": "proxycurl",
           "PROXYCURL_API_KEY": "your_proxycurl_api_key"
         }
       }
     }
   }
   ```

### Option B: LinkedIn Talent Solutions API

> **Note:** Requires LinkedIn partnership agreement. Most users should start with Proxycurl.

1. **Get LinkedIn API Credentials** from your LinkedIn Talent Solutions admin
2. **Configure Claude Desktop:**

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

### 3. Restart Claude Desktop

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

## Proxycurl Credit Costs

| Operation | Credits |
|-----------|---------|
| Person Search (per result) | 3 |
| Profile Details | 1 |
| Role Lookup | 3 |
| Person Lookup | 2 |

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
│         ┌──────────────┴──────────────┐                     │
│         ▼                              ▼                     │
│   ┌──────────┐                  ┌────────────┐              │
│   │Proxycurl │                  │  LinkedIn  │              │
│   │  API     │                  │ Talent API │              │
│   └──────────┘                  └────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## Switching Providers

To switch between providers, update the `DATA_PROVIDER` environment variable:

- `DATA_PROVIDER=proxycurl` - Use Proxycurl (default)
- `DATA_PROVIDER=linkedin` - Use LinkedIn Talent API

Then restart Claude Desktop.

## Development

```bash
# Watch mode for development
npm run dev

# Test with MCP Inspector
npm run inspector

# Build for production
npm run build
```

## Troubleshooting

**"Provider not configured" error:**
- Check that your API key/credentials are set in Claude Desktop config
- Restart Claude Desktop after config changes

**"Rate limit exceeded":**
- Wait a few minutes before making more requests
- Consider reducing `page_size` in searches

**Credits running low (Proxycurl):**
- Check balance at [https://nubela.co/proxycurl/dashboard](https://nubela.co/proxycurl/dashboard)
- Use `get_provider_status` tool to check remaining credits

## License

MIT
