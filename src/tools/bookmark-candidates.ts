/**
 * MCP Tools for bookmark management
 */

import { z } from "zod";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
  updateBookmark,
  getAllTags,
} from "../services/bookmark-store.js";
import { Candidate } from "../types/index.js";

// --- Add Bookmark Tool ---

export const addBookmarkSchema = z.object({
  candidate: z.object({
    source_id: z.string(),
    full_name: z.string(),
    headline: z.string().optional(),
    current_title: z.string().optional(),
    current_company: z.string().optional(),
    location: z.string().optional(),
    experience_years: z.number().optional(),
    skills: z.array(z.string()).optional(),
    profile_url: z.string(),
    seniority_level: z.string().optional(),
    industries: z.array(z.string()).optional(),
  }).describe("The candidate object from search results"),
  notes: z.string().optional().describe("Optional notes about this candidate"),
  tags: z.array(z.string()).optional().describe("Optional tags for categorization (e.g., ['shortlist', 'senior', 'java-expert'])"),
});

export async function addBookmarkHandler(input: z.infer<typeof addBookmarkSchema>) {
  const candidate: Candidate = {
    source: "linkedin",
    sourceId: input.candidate.source_id,
    fullName: input.candidate.full_name,
    headlineOrTitle: input.candidate.headline,
    currentTitle: input.candidate.current_title,
    currentCompany: input.candidate.current_company,
    location: input.candidate.location,
    experienceYears: input.candidate.experience_years,
    skills: input.candidate.skills,
    profileUrl: input.candidate.profile_url,
    seniorityLevel: input.candidate.seniority_level as Candidate["seniorityLevel"],
    industries: input.candidate.industries,
  };

  const bookmarked = await addBookmark(candidate, input.notes, input.tags);

  return {
    success: true,
    message: `Bookmarked ${bookmarked.fullName}`,
    bookmark: {
      source_id: bookmarked.sourceId,
      full_name: bookmarked.fullName,
      bookmarked_at: bookmarked.bookmarkedAt,
      notes: bookmarked.notes,
      tags: bookmarked.tags,
    },
  };
}

export const addBookmarkTool = {
  name: "bookmark_candidate",
  description: `Save a candidate to your bookmarks list for later review.

Use this to save promising candidates with optional notes and tags.
Tags can be used to categorize candidates (e.g., 'shortlist', 'follow-up', 'senior-role').`,
  inputSchema: addBookmarkSchema,
  handler: addBookmarkHandler,
};

// --- Remove Bookmark Tool ---

export const removeBookmarkSchema = z.object({
  source_id: z.string().describe("The candidate's source_id to remove from bookmarks"),
});

export async function removeBookmarkHandler(input: z.infer<typeof removeBookmarkSchema>) {
  const removed = await removeBookmark(input.source_id);

  return {
    success: removed,
    message: removed
      ? "Candidate removed from bookmarks"
      : "Candidate was not in bookmarks",
  };
}

export const removeBookmarkTool = {
  name: "remove_bookmark",
  description: "Remove a candidate from your bookmarks list.",
  inputSchema: removeBookmarkSchema,
  handler: removeBookmarkHandler,
};

// --- List Bookmarks Tool ---

export const listBookmarksSchema = z.object({
  tags: z.array(z.string()).optional().describe("Filter by tags (returns candidates with any of these tags)"),
  search_query: z.string().optional().describe("Search within bookmarks (searches name, title, company, skills, notes)"),
});

export async function listBookmarksHandler(input: z.infer<typeof listBookmarksSchema>) {
  const bookmarks = await getBookmarks({
    tags: input.tags,
    searchQuery: input.search_query,
  });

  return {
    count: bookmarks.length,
    bookmarks: bookmarks.map((b, index) => ({
      index: index + 1,
      source_id: b.sourceId,
      full_name: b.fullName,
      current_title: b.currentTitle,
      current_company: b.currentCompany,
      location: b.location,
      experience_years: b.experienceYears,
      skills: b.skills,
      profile_url: b.profileUrl,
      seniority_level: b.seniorityLevel,
      notes: b.notes,
      tags: b.tags,
      bookmarked_at: b.bookmarkedAt,
    })),
  };
}

export const listBookmarksTool = {
  name: "list_bookmarks",
  description: `List all bookmarked candidates.

Optionally filter by:
- Tags: Show only candidates with specific tags
- Search query: Search within name, title, company, skills, or notes`,
  inputSchema: listBookmarksSchema,
  handler: listBookmarksHandler,
};

// --- Update Bookmark Tool ---

export const updateBookmarkSchema = z.object({
  source_id: z.string().describe("The candidate's source_id"),
  notes: z.string().optional().describe("New notes (replaces existing)"),
  tags: z.array(z.string()).optional().describe("New tags (replaces existing)"),
});

export async function updateBookmarkHandler(input: z.infer<typeof updateBookmarkSchema>) {
  const updated = await updateBookmark(input.source_id, {
    notes: input.notes,
    tags: input.tags,
  });

  if (!updated) {
    return {
      success: false,
      message: "Candidate not found in bookmarks",
    };
  }

  return {
    success: true,
    message: "Bookmark updated",
    bookmark: {
      source_id: updated.sourceId,
      full_name: updated.fullName,
      notes: updated.notes,
      tags: updated.tags,
    },
  };
}

export const updateBookmarkTool = {
  name: "update_bookmark",
  description: "Update notes or tags for a bookmarked candidate.",
  inputSchema: updateBookmarkSchema,
  handler: updateBookmarkHandler,
};

// --- Get All Tags Tool ---

export const getAllTagsSchema = z.object({});

export async function getAllTagsHandler() {
  const tags = await getAllTags();

  return {
    tags,
    count: tags.length,
  };
}

export const getAllTagsTool = {
  name: "get_bookmark_tags",
  description: "Get all unique tags used across bookmarked candidates.",
  inputSchema: getAllTagsSchema,
  handler: getAllTagsHandler,
};
