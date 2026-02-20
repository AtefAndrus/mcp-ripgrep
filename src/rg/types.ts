export interface RgSearchOptions {
  pattern: string;
  path: string;
  fixedStrings?: boolean;
  caseSensitive?: boolean;
  wordMatch?: boolean;
  multiline?: boolean;
  fileType?: string;
  fileTypeNot?: string;
  glob?: string;
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
  fileType?: string;
  glob?: string;
  maxResults?: number;
  includeHidden?: boolean;
  onlyMatching?: boolean;
}

export interface RgCountOptions {
  pattern: string;
  path: string;
  countMode?: "lines" | "matches";
  fixedStrings?: boolean;
  caseSensitive?: boolean;
  wordMatch?: boolean;
  fileType?: string;
  fileTypeNot?: string;
  glob?: string;
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
  fileType?: string;
  fileTypeNot?: string;
  glob?: string;
  includeHidden?: boolean;
  followSymlinks?: boolean;
  maxDepth?: number;
  noIgnore?: boolean;
  sortBy?: "path" | "modified" | "created";
}

export interface RgListFilesOptions {
  path: string;
  fileType?: string;
  fileTypeNot?: string;
  glob?: string;
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
}
