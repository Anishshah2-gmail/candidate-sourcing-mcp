/**
 * Provider abstraction types
 * Allows switching between LinkedIn Official API and Proxycurl
 */

import { Candidate, CandidateDetailed, SearchFilters, SearchResult } from "./candidate.js";

export type ProviderType = "linkedin" | "proxycurl";

export interface IDataProvider {
  readonly providerName: ProviderType;

  /**
   * Search for candidates based on filters
   */
  searchCandidates(filters: SearchFilters): Promise<SearchResult>;

  /**
   * Get detailed profile for a specific candidate
   */
  getCandidateDetails(sourceId: string): Promise<CandidateDetailed>;

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean;

  /**
   * Get provider status/health info
   */
  getStatus(): ProviderStatus;
}

export interface ProviderStatus {
  provider: ProviderType;
  configured: boolean;
  rateLimitRemaining?: number;
  rateLimitReset?: string;
  creditsRemaining?: number;
  message?: string;
}

export interface ProviderConfig {
  type: ProviderType;

  // LinkedIn OAuth credentials
  linkedIn?: {
    clientId: string;
    clientSecret: string;
    accessToken?: string;
    refreshToken?: string;
  };

  // Proxycurl API key
  proxycurl?: {
    apiKey: string;
  };
}

/**
 * Get provider config from environment variables
 */
export function getProviderConfigFromEnv(): ProviderConfig {
  const providerType = (process.env.DATA_PROVIDER || "proxycurl") as ProviderType;

  return {
    type: providerType,
    linkedIn: {
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      refreshToken: process.env.LINKEDIN_REFRESH_TOKEN,
    },
    proxycurl: {
      apiKey: process.env.PROXYCURL_API_KEY || "",
    },
  };
}
