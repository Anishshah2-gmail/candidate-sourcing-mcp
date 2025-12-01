/**
 * Simple file-based bookmark storage for candidate bookmarks
 * Stores bookmarks in a JSON file in the user's home directory
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { BookmarkedCandidate, Candidate } from "../types/index.js";

const STORE_DIR = join(homedir(), ".candidate-sourcing");
const BOOKMARKS_FILE = join(STORE_DIR, "bookmarks.json");

interface BookmarkStore {
  bookmarks: BookmarkedCandidate[];
  lastUpdated: string;
}

async function ensureStoreDir(): Promise<void> {
  try {
    await mkdir(STORE_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

async function loadStore(): Promise<BookmarkStore> {
  try {
    const data = await readFile(BOOKMARKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {
      bookmarks: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

async function saveStore(store: BookmarkStore): Promise<void> {
  await ensureStoreDir();
  store.lastUpdated = new Date().toISOString();
  await writeFile(BOOKMARKS_FILE, JSON.stringify(store, null, 2), "utf-8");
}

/**
 * Add a candidate to bookmarks
 */
export async function addBookmark(
  candidate: Candidate,
  notes?: string,
  tags?: string[]
): Promise<BookmarkedCandidate> {
  const store = await loadStore();

  // Check if already bookmarked
  const existingIndex = store.bookmarks.findIndex(
    (b) => b.sourceId === candidate.sourceId
  );

  const bookmarked: BookmarkedCandidate = {
    ...candidate,
    bookmarkedAt: new Date().toISOString(),
    notes,
    tags,
  };

  if (existingIndex >= 0) {
    // Update existing bookmark
    store.bookmarks[existingIndex] = bookmarked;
  } else {
    // Add new bookmark
    store.bookmarks.push(bookmarked);
  }

  await saveStore(store);
  return bookmarked;
}

/**
 * Remove a candidate from bookmarks
 */
export async function removeBookmark(sourceId: string): Promise<boolean> {
  const store = await loadStore();
  const initialLength = store.bookmarks.length;

  store.bookmarks = store.bookmarks.filter((b) => b.sourceId !== sourceId);

  if (store.bookmarks.length < initialLength) {
    await saveStore(store);
    return true;
  }

  return false;
}

/**
 * Get all bookmarked candidates
 */
export async function getBookmarks(options?: {
  tags?: string[];
  searchQuery?: string;
}): Promise<BookmarkedCandidate[]> {
  const store = await loadStore();
  let bookmarks = store.bookmarks;

  // Filter by tags
  if (options?.tags?.length) {
    bookmarks = bookmarks.filter((b) =>
      options.tags!.some((tag) => b.tags?.includes(tag))
    );
  }

  // Filter by search query
  if (options?.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    bookmarks = bookmarks.filter((b) => {
      const searchText = [
        b.fullName,
        b.currentTitle,
        b.currentCompany,
        b.headlineOrTitle,
        b.notes,
        ...(b.skills || []),
        ...(b.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchText.includes(query);
    });
  }

  // Sort by bookmarked date (newest first)
  bookmarks.sort(
    (a, b) =>
      new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
  );

  return bookmarks;
}

/**
 * Update bookmark notes or tags
 */
export async function updateBookmark(
  sourceId: string,
  updates: { notes?: string; tags?: string[] }
): Promise<BookmarkedCandidate | null> {
  const store = await loadStore();
  const bookmark = store.bookmarks.find((b) => b.sourceId === sourceId);

  if (!bookmark) {
    return null;
  }

  if (updates.notes !== undefined) {
    bookmark.notes = updates.notes;
  }
  if (updates.tags !== undefined) {
    bookmark.tags = updates.tags;
  }

  await saveStore(store);
  return bookmark;
}

/**
 * Get a single bookmark by sourceId
 */
export async function getBookmark(
  sourceId: string
): Promise<BookmarkedCandidate | null> {
  const store = await loadStore();
  return store.bookmarks.find((b) => b.sourceId === sourceId) || null;
}

/**
 * Check if a candidate is bookmarked
 */
export async function isBookmarked(sourceId: string): Promise<boolean> {
  const store = await loadStore();
  return store.bookmarks.some((b) => b.sourceId === sourceId);
}

/**
 * Get all unique tags used in bookmarks
 */
export async function getAllTags(): Promise<string[]> {
  const store = await loadStore();
  const tags = new Set<string>();

  for (const bookmark of store.bookmarks) {
    for (const tag of bookmark.tags || []) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort();
}

/**
 * Export bookmarks in various formats
 */
export async function exportBookmarks(
  format: "json" | "csv"
): Promise<string> {
  const bookmarks = await getBookmarks();

  if (format === "json") {
    return JSON.stringify(bookmarks, null, 2);
  }

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
    "Notes",
    "Tags",
    "Bookmarked At",
  ];

  const rows = bookmarks.map((b) => [
    escapeCsvField(b.fullName),
    escapeCsvField(b.currentTitle || ""),
    escapeCsvField(b.currentCompany || ""),
    escapeCsvField(b.location || ""),
    b.experienceYears?.toString() || "",
    escapeCsvField((b.skills || []).join("; ")),
    b.profileUrl,
    b.seniorityLevel || "",
    escapeCsvField(b.notes || ""),
    escapeCsvField((b.tags || []).join("; ")),
    b.bookmarkedAt,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
