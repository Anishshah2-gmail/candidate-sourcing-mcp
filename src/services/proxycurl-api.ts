/**
 * Proxycurl API Integration
 *
 * Proxycurl is a B2B data enrichment API that provides LinkedIn profile data.
 * This is the recommended provider for getting started quickly without
 * needing LinkedIn partnership/API approval.
 *
 * API Documentation: https://nubela.co/proxycurl/docs
 * Pricing: ~$0.01-0.03 per profile (credit-based)
 */

import {
  Candidate,
  CandidateDetailed,
  SearchFilters,
  SearchResult,
  SeniorityLevel,
  WorkExperience,
  Education,
  IDataProvider,
  ProviderStatus,
} from "../types/index.js";

const BASE_URL = "https://nubela.co/proxycurl/api";

interface ProxycurlConfig {
  apiKey: string;
}

// Proxycurl Person Search response
interface ProxycurlSearchResponse {
  results: ProxycurlSearchResult[];
  next_page: string | null;
  total_result_count?: number;
}

interface ProxycurlSearchResult {
  linkedin_profile_url: string;
  profile?: ProxycurlProfile;
}

// Proxycurl Profile response
interface ProxycurlProfile {
  public_identifier?: string;
  profile_pic_url?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  headline?: string;
  summary?: string;
  country?: string;
  country_full_name?: string;
  city?: string;
  state?: string;
  occupation?: string;
  experiences?: ProxycurlExperience[];
  education?: ProxycurlEducation[];
  skills?: string[];
  certifications?: ProxycurlCertification[];
  languages?: string[];
  industry?: string;
  inferred_salary?: {
    min?: number;
    max?: number;
  };
  gender?: string;
  connections?: number;
}

interface ProxycurlExperience {
  starts_at?: { day?: number; month?: number; year?: number };
  ends_at?: { day?: number; month?: number; year?: number } | null;
  company?: string;
  company_linkedin_profile_url?: string;
  title?: string;
  description?: string;
  location?: string;
  logo_url?: string;
}

interface ProxycurlEducation {
  starts_at?: { day?: number; month?: number; year?: number };
  ends_at?: { day?: number; month?: number; year?: number } | null;
  school?: string;
  school_linkedin_profile_url?: string;
  degree_name?: string;
  field_of_study?: string;
  description?: string;
  logo_url?: string;
  grade?: string;
  activities_and_societies?: string;
}

interface ProxycurlCertification {
  name?: string;
  authority?: string;
  url?: string;
  starts_at?: { year?: number; month?: number };
  ends_at?: { year?: number; month?: number } | null;
}

// Role Lookup response
interface ProxycurlRoleLookupResponse {
  linkedin_profile_url: string;
  profile?: ProxycurlProfile;
}

export class ProxycurlApiService implements IDataProvider {
  readonly providerName = "proxycurl" as const;
  private config: ProxycurlConfig;
  private creditsRemaining?: number;

  constructor(config: ProxycurlConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }

  getStatus(): ProviderStatus {
    return {
      provider: "proxycurl",
      configured: this.isConfigured(),
      creditsRemaining: this.creditsRemaining,
      message: this.isConfigured()
        ? "Proxycurl API configured and ready"
        : "Missing PROXYCURL_API_KEY environment variable",
    };
  }

  /**
   * Make authenticated request to Proxycurl API
   */
  private async apiRequest<T>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined> = {}
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error(
        "Proxycurl API key not configured. Set PROXYCURL_API_KEY environment variable."
      );
    }

    // Build query string
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.set(key, String(value));
      }
    }

    const url = `${BASE_URL}${endpoint}${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Track credits from response headers
    const creditsHeader = response.headers.get("X-Proxycurl-Credit-Cost");
    if (creditsHeader) {
      // Note: Proxycurl doesn't return remaining credits in headers
      // You'd need to call the credit balance endpoint separately
    }

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 401) {
        throw new Error("Invalid Proxycurl API key. Please check your PROXYCURL_API_KEY.");
      }
      if (response.status === 403) {
        throw new Error("Proxycurl API access forbidden. Check your API key permissions.");
      }
      if (response.status === 429) {
        throw new Error("Proxycurl rate limit exceeded. Please wait before making more requests.");
      }
      throw new Error(`Proxycurl API error (${response.status}): ${errorBody}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Format date from Proxycurl format
   */
  private formatDate(date?: { day?: number; month?: number; year?: number }): string | undefined {
    if (!date?.year) return undefined;
    const month = date.month ? String(date.month).padStart(2, "0") : "01";
    return `${date.year}-${month}`;
  }

  /**
   * Calculate years of experience from experiences array
   */
  private calculateExperienceYears(experiences?: ProxycurlExperience[]): number | undefined {
    if (!experiences?.length) return undefined;

    let totalMonths = 0;
    const now = new Date();

    for (const exp of experiences) {
      if (!exp.starts_at?.year) continue;

      const startYear = exp.starts_at.year;
      const startMonth = exp.starts_at.month || 1;

      let endYear: number;
      let endMonth: number;

      if (exp.ends_at?.year) {
        endYear = exp.ends_at.year;
        endMonth = exp.ends_at.month || 12;
      } else {
        endYear = now.getFullYear();
        endMonth = now.getMonth() + 1;
      }

      const months = (endYear - startYear) * 12 + (endMonth - startMonth);
      totalMonths += Math.max(0, months);
    }

    return Math.round(totalMonths / 12);
  }

  /**
   * Infer seniority level from title
   */
  private inferSeniorityFromTitle(title?: string): SeniorityLevel | undefined {
    if (!title) return undefined;

    const titleLower = title.toLowerCase();

    if (/(ceo|cto|cfo|coo|chief|founder|co-founder)/i.test(titleLower)) return "c-level";
    if (/\b(vp|vice president)\b/i.test(titleLower)) return "vp";
    if (/\bdirector\b/i.test(titleLower)) return "director";
    if (/\b(manager|head of)\b/i.test(titleLower)) return "manager";
    if (/\b(lead|principal|staff|architect)\b/i.test(titleLower)) return "lead";
    if (/\bsenior\b/i.test(titleLower)) return "senior";
    if (/\b(junior|jr\.?|associate)\b/i.test(titleLower)) return "junior";
    if (/\b(intern|trainee|entry|graduate)\b/i.test(titleLower)) return "entry";

    return "mid";
  }

  /**
   * Transform Proxycurl profile to our Candidate format
   */
  private transformProfile(profile: ProxycurlProfile, profileUrl: string): Candidate {
    const currentExperience = profile.experiences?.find((e) => !e.ends_at);
    const location = [profile.city, profile.state, profile.country_full_name]
      .filter(Boolean)
      .join(", ");

    return {
      source: "linkedin",
      sourceId: profile.public_identifier || profileUrl.split("/in/")[1]?.replace(/\/$/, "") || profileUrl,
      fullName: profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
      headlineOrTitle: profile.headline,
      currentTitle: currentExperience?.title || profile.occupation,
      currentCompany: currentExperience?.company,
      location: location || undefined,
      experienceYears: this.calculateExperienceYears(profile.experiences),
      skills: profile.skills,
      profileUrl,
      seniorityLevel: this.inferSeniorityFromTitle(currentExperience?.title || profile.headline),
      industries: profile.industry ? [profile.industry] : undefined,
      summary: profile.summary,
    };
  }

  /**
   * Transform Proxycurl profile to detailed candidate format
   */
  private transformProfileDetailed(profile: ProxycurlProfile, profileUrl: string): CandidateDetailed {
    const base = this.transformProfile(profile, profileUrl);

    const experience: WorkExperience[] | undefined = profile.experiences?.map((exp) => ({
      title: exp.title || "Unknown",
      company: exp.company || "Unknown",
      location: exp.location,
      startDate: this.formatDate(exp.starts_at),
      endDate: exp.ends_at ? this.formatDate(exp.ends_at) : undefined,
      description: exp.description,
      isCurrent: !exp.ends_at,
    }));

    const education: Education[] | undefined = profile.education?.map((edu) => ({
      school: edu.school || "Unknown",
      degree: edu.degree_name,
      fieldOfStudy: edu.field_of_study,
      startDate: this.formatDate(edu.starts_at),
      endDate: edu.ends_at ? this.formatDate(edu.ends_at) : undefined,
    }));

    return {
      ...base,
      experience,
      education,
      certifications: profile.certifications?.map((c) => c.name).filter((n): n is string => !!n),
      languages: profile.languages,
    };
  }

  /**
   * Search for candidates using Proxycurl Person Search API
   * Cost: 3 credits per result returned
   */
  async searchCandidates(filters: SearchFilters): Promise<SearchResult> {
    // Build search parameters for Proxycurl Person Search API
    const params: Record<string, string | number | boolean | undefined> = {
      page_size: filters.pageSize || 10,
      enrich_profiles: "enrich", // Get full profile data with search
    };

    // Location filters
    if (filters.locations?.length) {
      // Proxycurl uses separate city, region, country params
      // For simplicity, we'll use the first location and try to parse it
      const location = filters.locations[0];
      if (location.toLowerCase().includes("india")) {
        params.country = "IN";
      }
      // Extract city if present
      const cityMatch = location.match(/^([^,]+)/);
      if (cityMatch) {
        params.city = cityMatch[1].trim();
      }
    }

    // Job title / role filter
    if (filters.titles?.length) {
      params.current_role_title = filters.titles.join(" OR ");
    }

    // Company filters
    if (filters.includeCompanies?.length) {
      params.current_company_name = filters.includeCompanies.join(" OR ");
    }

    // Industry filter
    if (filters.industries?.length) {
      params.industries = filters.industries.join(" OR ");
    }

    // Skills - use keyword search
    if (filters.skills?.length || filters.mustHaveKeywords?.length) {
      const keywords = [...(filters.skills || []), ...(filters.mustHaveKeywords || [])];
      params.keyword = keywords.join(" ");
    }

    // Pagination
    if (filters.cursor) {
      params.next_page = filters.cursor;
    }

    const response = await this.apiRequest<ProxycurlSearchResponse>(
      "/v2/search/person",
      params
    );

    // Transform results
    let candidates = response.results
      .filter((r) => r.profile) // Only include results with profile data
      .map((r) => this.transformProfile(r.profile!, r.linkedin_profile_url));

    // Apply post-processing filters that Proxycurl doesn't support natively

    // Exclude companies
    if (filters.excludeCompanies?.length) {
      const excludeSet = new Set(filters.excludeCompanies.map((c) => c.toLowerCase()));
      candidates = candidates.filter(
        (c) => !c.currentCompany || !excludeSet.has(c.currentCompany.toLowerCase())
      );
    }

    // Exclude keywords
    if (filters.excludeKeywords?.length) {
      candidates = candidates.filter((c) => {
        const searchText = [c.fullName, c.headlineOrTitle, c.currentTitle, c.summary]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return !filters.excludeKeywords!.some((kw) => searchText.includes(kw.toLowerCase()));
      });
    }

    // Filter by experience years
    if (filters.minExperienceYears !== undefined) {
      candidates = candidates.filter(
        (c) => c.experienceYears === undefined || c.experienceYears >= filters.minExperienceYears!
      );
    }
    if (filters.maxExperienceYears !== undefined) {
      candidates = candidates.filter(
        (c) => c.experienceYears === undefined || c.experienceYears <= filters.maxExperienceYears!
      );
    }

    // Filter by seniority
    if (filters.seniorityLevels?.length) {
      candidates = candidates.filter(
        (c) => !c.seniorityLevel || filters.seniorityLevels!.includes(c.seniorityLevel)
      );
    }

    return {
      candidates,
      pagination: {
        nextCursor: response.next_page || undefined,
        hasMore: !!response.next_page,
        totalEstimated: response.total_result_count,
      },
      meta: {
        searchId: undefined,
      },
    };
  }

  /**
   * Get detailed profile for a candidate
   * Cost: 1 credit per request
   */
  async getCandidateDetails(sourceId: string): Promise<CandidateDetailed> {
    // sourceId can be either a public identifier or full URL
    let profileUrl = sourceId;
    if (!sourceId.startsWith("http")) {
      profileUrl = `https://www.linkedin.com/in/${sourceId}`;
    }

    const profile = await this.apiRequest<ProxycurlProfile>("/v2/linkedin", {
      linkedin_profile_url: profileUrl,
      skills: "include",
      inferred_salary: "include",
      personal_email: "include",
      personal_contact_number: "include",
    });

    return this.transformProfileDetailed(profile, profileUrl);
  }

  /**
   * Role Lookup - Find person by role at a company
   * Cost: 3 credits per request
   */
  async lookupByRole(role: string, companyName: string): Promise<Candidate | null> {
    try {
      const response = await this.apiRequest<ProxycurlRoleLookupResponse>(
        "/find/company/role",
        {
          role,
          company_name: companyName,
          enrich_profile: "enrich",
        }
      );

      if (!response.profile) {
        return null;
      }

      return this.transformProfile(response.profile, response.linkedin_profile_url);
    } catch (error) {
      // Role not found returns 404
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Person Lookup - Find person by name and company
   * Cost: 2 credits per request
   */
  async lookupByNameAndCompany(
    firstName: string,
    companyDomain: string,
    lastName?: string,
    title?: string
  ): Promise<string | null> {
    try {
      const response = await this.apiRequest<{ url: string }>("/linkedin/profile/resolve", {
        first_name: firstName,
        company_domain: companyDomain,
        last_name: lastName,
        title,
      });

      return response.url || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get credit balance
   */
  async getCreditBalance(): Promise<number> {
    const response = await this.apiRequest<{ credit_balance: number }>("/credit-balance");
    this.creditsRemaining = response.credit_balance;
    return response.credit_balance;
  }
}

// Singleton instance
let proxycurlService: ProxycurlApiService | null = null;

export function getProxycurlService(): ProxycurlApiService {
  if (!proxycurlService) {
    const apiKey = process.env.PROXYCURL_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Proxycurl API key not configured. Set PROXYCURL_API_KEY environment variable."
      );
    }

    proxycurlService = new ProxycurlApiService({ apiKey });
  }

  return proxycurlService;
}

export function initProxycurlService(apiKey: string): ProxycurlApiService {
  proxycurlService = new ProxycurlApiService({ apiKey });
  return proxycurlService;
}
