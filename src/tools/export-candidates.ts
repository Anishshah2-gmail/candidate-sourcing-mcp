/**
 * MCP Tools for exporting candidates
 */

import { z } from "zod";
import { exportBookmarks, getBookmarks } from "../services/bookmark-store.js";
import { Candidate } from "../types/index.js";

// Store for last search results (for export)
let lastSearchResults: Candidate[] = [];

export function setLastSearchResults(candidates: Candidate[]): void {
  lastSearchResults = candidates;
}

export function getLastSearchResults(): Candidate[] {
  return lastSearchResults;
}

// --- Export Candidates Tool ---

export const exportCandidatesSchema = z.object({
  format: z.enum(["json", "csv"]).describe("Export format"),
  source: z
    .enum(["last_search", "bookmarks"])
    .describe("Which candidates to export: 'last_search' for most recent search results, 'bookmarks' for saved candidates"),
  bookmark_tags: z
    .array(z.string())
    .optional()
    .describe("When source is 'bookmarks', optionally filter by these tags"),
});

export type ExportCandidatesInput = z.infer<typeof exportCandidatesSchema>;

export async function exportCandidatesHandler(input: ExportCandidatesInput) {
  let data: string;
  let count: number;

  if (input.source === "bookmarks") {
    // Export bookmarks
    data = await exportBookmarks(input.format);
    const bookmarks = await getBookmarks({ tags: input.bookmark_tags });
    count = bookmarks.length;
  } else {
    // Export last search results
    const candidates = getLastSearchResults();
    count = candidates.length;

    if (input.format === "json") {
      data = JSON.stringify(
        candidates.map((c) => ({
          source: c.source,
          source_id: c.sourceId,
          full_name: c.fullName,
          headline: c.headlineOrTitle,
          current_title: c.currentTitle,
          current_company: c.currentCompany,
          location: c.location,
          experience_years: c.experienceYears,
          skills: c.skills,
          profile_url: c.profileUrl,
          seniority_level: c.seniorityLevel,
          industries: c.industries,
        })),
        null,
        2
      );
    } else {
      // CSV format
      const headers = [
        "Full Name",
        "Current Title",
        "Current Company",
        "Location",
        "Experience Years",
        "Skills",
        "Profile URL",
        "Seniority",
        "Industries",
      ];

      const rows = candidates.map((c) => [
        escapeCsvField(c.fullName),
        escapeCsvField(c.currentTitle || ""),
        escapeCsvField(c.currentCompany || ""),
        escapeCsvField(c.location || ""),
        c.experienceYears?.toString() || "",
        escapeCsvField((c.skills || []).join("; ")),
        c.profileUrl,
        c.seniorityLevel || "",
        escapeCsvField((c.industries || []).join("; ")),
      ]);

      data = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }
  }

  return {
    format: input.format,
    source: input.source,
    count,
    data,
    message: `Exported ${count} candidates as ${input.format.toUpperCase()}`,
  };
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export const exportCandidatesTool = {
  name: "export_candidates",
  description: `Export candidates to JSON or CSV format.

Can export either:
- 'last_search': The most recent search results
- 'bookmarks': Your saved/bookmarked candidates (optionally filtered by tags)

Returns the formatted data as a string that can be copied or saved.`,
  inputSchema: exportCandidatesSchema,
  handler: exportCandidatesHandler,
};
