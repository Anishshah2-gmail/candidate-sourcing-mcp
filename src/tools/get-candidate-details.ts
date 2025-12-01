/**
 * MCP Tool: linkedin_get_candidate_details
 * Fetch detailed profile information for a specific candidate
 */

import { z } from "zod";
import { getLinkedInService } from "../services/linkedin-api.js";

export const getCandidateDetailsSchema = z.object({
  source_id: z
    .string()
    .describe("The candidate's LinkedIn member ID / URN from search results"),
});

export type GetCandidateDetailsInput = z.infer<typeof getCandidateDetailsSchema>;

export async function getCandidateDetails(input: GetCandidateDetailsInput) {
  const linkedIn = getLinkedInService();

  const candidate = await linkedIn.getCandidateDetails(input.source_id);

  // Format response for MCP
  return {
    source: candidate.source,
    source_id: candidate.sourceId,
    full_name: candidate.fullName,
    headline: candidate.headlineOrTitle,
    current_title: candidate.currentTitle,
    current_company: candidate.currentCompany,
    location: candidate.location,
    experience_years: candidate.experienceYears,
    skills: candidate.skills,
    profile_url: candidate.profileUrl,
    seniority_level: candidate.seniorityLevel,
    industries: candidate.industries,
    summary: candidate.summary,
    experience: candidate.experience?.map((exp) => ({
      title: exp.title,
      company: exp.company,
      location: exp.location,
      start_date: exp.startDate,
      end_date: exp.endDate,
      description: exp.description,
      is_current: exp.isCurrent,
    })),
    education: candidate.education?.map((edu) => ({
      school: edu.school,
      degree: edu.degree,
      field_of_study: edu.fieldOfStudy,
      start_date: edu.startDate,
      end_date: edu.endDate,
    })),
    certifications: candidate.certifications,
    languages: candidate.languages,
  };
}

export const getCandidateDetailsTool = {
  name: "linkedin_get_candidate_details",
  description: `Fetch detailed profile information for a specific LinkedIn candidate.

Use this tool to get comprehensive details about a candidate including:
- Full work history (all positions with dates and descriptions)
- Education background
- Complete skills list
- Certifications and languages

Requires the source_id from a previous search result.`,
  inputSchema: getCandidateDetailsSchema,
  handler: getCandidateDetails,
};
