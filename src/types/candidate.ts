// Core candidate types used throughout the application

export interface Candidate {
  source: "linkedin";
  sourceId: string;
  fullName: string;
  headlineOrTitle?: string;
  currentCompany?: string;
  currentTitle?: string;
  location?: string;
  experienceYears?: number;
  skills?: string[];
  profileUrl: string;
  seniorityLevel?: SeniorityLevel;
  industries?: string[];
  summary?: string;
  lastUpdated?: string;
  extra?: Record<string, unknown>;
}

export interface CandidateDetailed extends Candidate {
  experience?: WorkExperience[];
  education?: Education[];
  certifications?: string[];
  languages?: string[];
}

export interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isCurrent?: boolean;
}

export interface Education {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export type SeniorityLevel =
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "lead"
  | "manager"
  | "director"
  | "vp"
  | "c-level"
  | "owner";

export interface SearchFilters {
  titles?: string[];
  locations?: string[];
  skills?: string[];
  minExperienceYears?: number;
  maxExperienceYears?: number;
  seniorityLevels?: SeniorityLevel[];
  includeCompanies?: string[];
  excludeCompanies?: string[];
  industries?: string[];
  mustHaveKeywords?: string[];
  excludeKeywords?: string[];
  pageSize?: number;
  cursor?: string;
}

export interface SearchResult {
  candidates: Candidate[];
  pagination: {
    nextCursor?: string;
    hasMore: boolean;
    totalEstimated?: number;
  };
  meta?: {
    searchId?: string;
    rateLimitRemaining?: number;
    rateLimitReset?: string;
  };
}

export interface BookmarkedCandidate extends Candidate {
  bookmarkedAt: string;
  notes?: string;
  tags?: string[];
}

export interface ExportOptions {
  format: "json" | "csv";
  includeDetails?: boolean;
  fields?: string[];
}
