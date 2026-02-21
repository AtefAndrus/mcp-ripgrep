export interface RgSearchOptions {
  pattern: string;
  path: string;
  fixedStrings?: boolean;
  caseSensitive?: boolean;
  wordMatch?: boolean;
  multiline?: boolean;
  fileType?: string | string[];
  fileTypeNot?: string | string[];
  glob?: string | string[];
  maxResults?: number;
  contextLines?: number;
  beforeContext?: number;
  afterContext?: number;
  invertMatch?: boolean;
  includeHidden?: boolean;
  followSymlinks?: boolean;
  maxDepth?: number;
  additionalPatterns?: string[];
  jsonOutput?: boolean;
  maxColumns?: number;
  noIgnore?: boolean;
  sortBy?: "path" | "modified" | "created";
}

export interface RgReplaceOptions {
  pattern: string;
  replacement: string;
  path: string;
  fixedStrings?: boolean;
  caseSensitive?: boolean;
  wordMatch?: boolean;
  multiline?: boolean;
  fileType?: string | string[];
  glob?: string | string[];
  maxResults?: number;
  includeHidden?: boolean;
  onlyMatching?: boolean;
  fileTypeNot?: string | string[];
  noIgnore?: boolean;
  maxDepth?: number;
  followSymlinks?: boolean;
}

export interface RgCountOptions {
  pattern: string;
  path: string;
  countMode?: "lines" | "matches";
  fixedStrings?: boolean;
  caseSensitive?: boolean;
  wordMatch?: boolean;
  fileType?: string | string[];
  fileTypeNot?: string | string[];
  glob?: string | string[];
  includeHidden?: boolean;
  includeZero?: boolean;
  noIgnore?: boolean;
}

export interface RgSearchFilesOptions {
  pattern: string;
  path: string;
  invertMatch?: boolean;
  fixedStrings?: boolean;
  caseSensitive?: boolean;
  wordMatch?: boolean;
  fileType?: string | string[];
  fileTypeNot?: string | string[];
  glob?: string | string[];
  includeHidden?: boolean;
  followSymlinks?: boolean;
  maxDepth?: number;
  noIgnore?: boolean;
  sortBy?: "path" | "modified" | "created";
}

export interface RgListFilesOptions {
  path: string;
  fileType?: string | string[];
  fileTypeNot?: string | string[];
  glob?: string | string[];
  includeHidden?: boolean;
  followSymlinks?: boolean;
  maxDepth?: number;
  noIgnore?: boolean;
  sortBy?: "path" | "modified" | "created";
}

export interface RgCommand {
  command: string;
  args: string[];
}

export interface RgResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  truncatedByExecutor?: boolean;
}
