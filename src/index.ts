#!/usr/bin/env node
/**
 * Candidate Sourcing MCP Server
 *
 * An MCP server that provides LinkedIn-based candidate sourcing tools
 * for use with Claude Desktop and other MCP clients.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  searchCandidatesTool,
  getCandidateDetailsTool,
  addBookmarkTool,
  removeBookmarkTool,
  listBookmarksTool,
  updateBookmarkTool,
  getAllTagsTool,
  exportCandidatesTool,
  setLastSearchResults,
  getProviderStatusTool,
} from "./tools/index.js";
import { Candidate } from "./types/index.js";

// Create the MCP server
const server = new McpServer({
  name: "candidate-sourcing",
  version: "1.0.0",
});

// Register all tools

// 1. LinkedIn Search Candidates
server.tool(
  searchCandidatesTool.name,
  searchCandidatesTool.description,
  searchCandidatesTool.inputSchema.shape,
  async (args) => {
    try {
      const input = searchCandidatesTool.inputSchema.parse(args);
      const result = await searchCandidatesTool.handler(input);

      // Store results for export functionality
      const candidates: Candidate[] = result.candidates.map((c) => ({
        source: "linkedin" as const,
        sourceId: c.source_id,
        fullName: c.full_name,
        headlineOrTitle: c.headline,
        currentTitle: c.current_title,
        currentCompany: c.current_company,
        location: c.location,
        experienceYears: c.experience_years,
        skills: c.skills,
        profileUrl: c.profile_url,
        seniorityLevel: c.seniority_level as Candidate["seniorityLevel"],
        industries: c.industries,
      }));
      setLastSearchResults(candidates);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// 2. Get Candidate Details
server.tool(
  getCandidateDetailsTool.name,
  getCandidateDetailsTool.description,
  getCandidateDetailsTool.inputSchema.shape,
  async (args) => {
    try {
      const input = getCandidateDetailsTool.inputSchema.parse(args);
      const result = await getCandidateDetailsTool.handler(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// 3. Add Bookmark
server.tool(
  addBookmarkTool.name,
  addBookmarkTool.description,
  addBookmarkTool.inputSchema.shape,
  async (args) => {
    try {
      const input = addBookmarkTool.inputSchema.parse(args);
      const result = await addBookmarkTool.handler(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// 4. Remove Bookmark
server.tool(
  removeBookmarkTool.name,
  removeBookmarkTool.description,
  removeBookmarkTool.inputSchema.shape,
  async (args) => {
    try {
      const input = removeBookmarkTool.inputSchema.parse(args);
      const result = await removeBookmarkTool.handler(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// 5. List Bookmarks
server.tool(
  listBookmarksTool.name,
  listBookmarksTool.description,
  listBookmarksTool.inputSchema.shape,
  async (args) => {
    try {
      const input = listBookmarksTool.inputSchema.parse(args);
      const result = await listBookmarksTool.handler(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// 6. Update Bookmark
server.tool(
  updateBookmarkTool.name,
  updateBookmarkTool.description,
  updateBookmarkTool.inputSchema.shape,
  async (args) => {
    try {
      const input = updateBookmarkTool.inputSchema.parse(args);
      const result = await updateBookmarkTool.handler(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// 7. Get All Bookmark Tags
server.tool(
  getAllTagsTool.name,
  getAllTagsTool.description,
  getAllTagsTool.inputSchema.shape,
  async () => {
    try {
      const result = await getAllTagsTool.handler();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// 8. Export Candidates
server.tool(
  exportCandidatesTool.name,
  exportCandidatesTool.description,
  exportCandidatesTool.inputSchema.shape,
  async (args) => {
    try {
      const input = exportCandidatesTool.inputSchema.parse(args);
      const result = await exportCandidatesTool.handler(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// 9. Get Provider Status
server.tool(
  getProviderStatusTool.name,
  getProviderStatusTool.description,
  getProviderStatusTool.inputSchema.shape,
  async () => {
    try {
      const result = await getProviderStatusTool.handler();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Candidate Sourcing MCP Server started");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
