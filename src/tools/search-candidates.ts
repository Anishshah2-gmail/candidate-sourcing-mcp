/**
 * MCP Tool: linkedin_search_candidates
 * Search LinkedIn for candidates matching structured filters
 */

import { z } from "zod";
import { getDataProvider } from "../services/provider-factory.js";
import { SearchFilters, SeniorityLevel } from "../types/index.js";

export const searchCandidatesSchema = z.object({
  titles: z
    .array(z.string())
    .optional()
    .describe("Target job titles (primary + alternates). Example: ['Senior Data Engineer', 'Data Engineer']"),
  locations: z
    .array(z.string())
    .optional()
    .describe("City/region names. Example: ['Bengaluru, India', 'Mumbai, India']"),
  skills: z
    .array(z.string())
    .optional()
    .describe("Core skills / tech stack. Example: ['Python', 'Spark', 'AWS']"),
  min_experience_years: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Minimum years of experience"),
  max_experience_years: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Maximum years of experience"),
  seniority_levels: z
    .array(
      z.enum([
        "entry",
        "junior",
        "mid",
        "senior",
        "lead",
        "manager",
        "director",
        "vp",
        "c-level",
        "owner",
      ])
    )
    .optional()
    .describe("Seniority levels to target"),
  include_companies: z
    .array(z.string())
    .optional()
    .describe("Companies to prioritize/include"),
  exclude_companies: z
    .array(z.string())
    .optional()
    .describe("Companies to avoid (e.g., FAANG)"),
  industries: z
    .array(z.string())
    .optional()
    .describe("Target industries. Example: ['FinTech', 'Banking']"),
  must_have_keywords: z
    .array(z.string())
    .optional()
    .describe("Phrases that must appear in profile/summary"),
  exclude_keywords: z
    .array(z.string())
    .optional()
    .describe("Phrases to avoid (e.g., 'consultant', 'freelancer')"),
  page_size: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20)
    .describe("Number of results per page (default: 20, max: 50)"),
  cursor: z
    .string()
    .optional()
    .describe("Pagination cursor for fetching more results"),
});

export type SearchCandidatesInput = z.infer<typeof searchCandidatesSchema>;

export async function searchCandidates(input: SearchCandidatesInput) {
  const provider = getDataProvider();

  // Transform input to internal filter format
  const filters: SearchFilters = {
    titles: input.titles,
    locations: input.locations,
    skills: input.skills,
    minExperienceYears: input.min_experience_years,
    maxExperienceYears: input.max_experience_years,
    seniorityLevels: input.seniority_levels as SeniorityLevel[] | undefined,
    includeCompanies: input.include_companies,
    excludeCompanies: input.exclude_companies,
    industries: input.industries,
    mustHaveKeywords: input.must_have_keywords,
    excludeKeywords: input.exclude_keywords,
    pageSize: input.page_size,
    cursor: input.cursor,
  };

  const result = await provider.searchCandidates(filters);

  // Format response for MCP
  return {
    candidates: result.candidates.map((c, index) => ({
      index: index + 1,
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
    pagination: {
      next_cursor: result.pagination.nextCursor,
      has_more: result.pagination.hasMore,
      total_estimated: result.pagination.totalEstimated,
    },
    meta: result.meta,
  };
}

export const searchCandidatesTool = {
  name: "linkedin_search_candidates",
  description: `Search LinkedIn for candidates matching structured filters.

Use this tool to find candidates based on:
- Job titles (current or past)
- Locations (cities/regions)
- Skills and technologies
- Years of experience
- Seniority level
- Companies (include or exclude)
- Industries
- Keywords (must have or exclude)

Returns a list of matching candidates with their basic profile information.
Use the cursor parameter to paginate through results.`,
  inputSchema: searchCandidatesSchema,
  handler: searchCandidates,
};
