# Candidate Sourcing MCP Server

An MCP (Model Context Protocol) server for LinkedIn-based candidate sourcing, designed to work with Claude Desktop.

## Features

- **LinkedIn Search** - Search candidates with filters (titles, skills, locations, experience, seniority, companies, industries)
- **Detailed Profiles** - Fetch full profile information for candidates
- **Bookmarks** - Save candidates with notes and tags for later review
- **Export** - Export candidates to JSON or CSV format

## MCP Tools

| Tool | Description |
|------|-------------|
| `linkedin_search_candidates` | Search LinkedIn with structured filters |
| `linkedin_get_candidate_details` | Get full profile details for a candidate |
| `bookmark_candidate` | Save a candidate with notes/tags |
| `remove_bookmark` | Remove from bookmarks |
| `list_bookmarks` | List all bookmarked candidates |
| `update_bookmark` | Update notes/tags |
| `get_bookmark_tags` | List all tags in use |
| `export_candidates` | Export to JSON/CSV |

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

### 1. Get LinkedIn API Credentials

You need LinkedIn Talent Solutions API credentials:
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_REFRESH_TOKEN` (optional)

Get these from [LinkedIn Developer Portal](https://www.linkedin.com/developers/) or your LinkedIn Talent Solutions admin.

### 2. Configure Claude Desktop

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "candidate-sourcing": {
      "command": "node",
      "args": ["/path/to/candidate-sourcing-mcp/dist/index.js"],
      "env": {
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
2. Call the MCP tools to search LinkedIn
3. Present candidates in a recruiter-friendly format
4. Support refinements like "exclude FAANG" or "add Mumbai"

## Development

```bash
# Watch mode
npm run dev

# Test with MCP Inspector
npm run inspector
```

## License

MIT
