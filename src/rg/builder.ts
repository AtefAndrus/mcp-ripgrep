import type {
  RgCommand,
  RgCountOptions,
  RgListFilesOptions,
  RgReplaceOptions,
  RgSearchFilesOptions,
  RgSearchOptions,
} from "./types.js";

function appendCaseFlag(args: string[], caseSensitive?: boolean): void {
  if (caseSensitive === true) {
    args.push("-s");
  } else if (caseSensitive === false) {
    args.push("-i");
  } else {
    args.push("-S");
  }
}

function appendTypeFlags(
  args: string[],
  fileType?: string | string[],
  fileTypeNot?: string | string[],
): void {
  if (fileType) {
    const types = Array.isArray(fileType) ? fileType : [fileType];
    for (const t of types) args.push("-t", t);
  }
  if (fileTypeNot) {
    const types = Array.isArray(fileTypeNot) ? fileTypeNot : [fileTypeNot];
    for (const t of types) args.push("-T", t);
  }
}

function appendGlobFlag(args: string[], glob?: string | string[]): void {
  if (glob) {
    const globs = Array.isArray(glob) ? glob : [glob];
    for (const g of globs) args.push("-g", g);
  }
}

function appendHiddenFlag(args: string[], includeHidden?: boolean): void {
  if (includeHidden) {
    args.push("--hidden");
  }
}

function appendFollowFlag(args: string[], followSymlinks?: boolean): void {
  if (followSymlinks) {
    args.push("-L");
  }
}

function appendMaxDepthFlag(args: string[], maxDepth?: number): void {
  if (maxDepth !== undefined) {
    args.push("-d", String(maxDepth));
  }
}

function appendNoIgnoreFlag(args: string[], noIgnore?: boolean): void {
  if (noIgnore) {
    args.push("--no-ignore");
  }
}

function appendSortFlag(args: string[], sortBy?: string): void {
  if (sortBy) {
    args.push(`--sort=${sortBy}`);
  }
}

export function buildSearchCommand(opts: RgSearchOptions): RgCommand {
  const args: string[] = ["-n", "--color", "never", "--no-heading", "--stats"];

  appendCaseFlag(args, opts.caseSensitive);
  if (opts.fixedStrings) args.push("-F");
  if (opts.wordMatch) args.push("-w");
  if (opts.multiline) args.push("-U", "--multiline-dotall");
  appendTypeFlags(args, opts.fileType, opts.fileTypeNot);
  appendGlobFlag(args, opts.glob);
  if (opts.maxResults !== undefined) args.push("-m", String(opts.maxResults));
  if (opts.contextLines !== undefined)
    args.push("-C", String(opts.contextLines));
  if (opts.beforeContext !== undefined)
    args.push("-B", String(opts.beforeContext));
  if (opts.afterContext !== undefined)
    args.push("-A", String(opts.afterContext));
  if (opts.invertMatch) args.push("-v");
  appendHiddenFlag(args, opts.includeHidden);
  appendFollowFlag(args, opts.followSymlinks);
  appendMaxDepthFlag(args, opts.maxDepth);
  if (opts.jsonOutput) args.push("--json");
  if (opts.maxColumns !== undefined) args.push("-M", String(opts.maxColumns));
  appendNoIgnoreFlag(args, opts.noIgnore);
  appendSortFlag(args, opts.sortBy);

  if (opts.additionalPatterns && opts.additionalPatterns.length > 0) {
    args.push("-e", opts.pattern);
    for (const p of opts.additionalPatterns) {
      args.push("-e", p);
    }
    args.push("--", opts.path);
  } else {
    args.push("--", opts.pattern, opts.path);
  }

  return { command: "rg", args };
}

export function buildReplaceCommand(opts: RgReplaceOptions): RgCommand {
  const args: string[] = ["-n", "--color", "never", "--no-heading"];

  appendCaseFlag(args, opts.caseSensitive);
  if (opts.fixedStrings) args.push("-F");
  if (opts.wordMatch) args.push("-w");
  if (opts.multiline) args.push("-U", "--multiline-dotall");
  appendTypeFlags(args, opts.fileType, opts.fileTypeNot);
  appendGlobFlag(args, opts.glob);
  if (opts.maxResults !== undefined) args.push("-m", String(opts.maxResults));
  appendHiddenFlag(args, opts.includeHidden);
  appendFollowFlag(args, opts.followSymlinks);
  appendMaxDepthFlag(args, opts.maxDepth);
  appendNoIgnoreFlag(args, opts.noIgnore);
  if (opts.onlyMatching) args.push("-o");
  args.push("-r", opts.replacement);
  args.push("--", opts.pattern, opts.path);

  return { command: "rg", args };
}

export function buildCountCommand(opts: RgCountOptions): RgCommand {
  const args: string[] = ["--color", "never"];

  if (opts.countMode === "matches") {
    args.push("--count-matches");
  } else {
    args.push("-c");
  }

  appendCaseFlag(args, opts.caseSensitive);
  if (opts.fixedStrings) args.push("-F");
  if (opts.wordMatch) args.push("-w");
  appendTypeFlags(args, opts.fileType, opts.fileTypeNot);
  appendGlobFlag(args, opts.glob);
  appendHiddenFlag(args, opts.includeHidden);
  if (opts.includeZero) args.push("--include-zero");
  appendNoIgnoreFlag(args, opts.noIgnore);
  args.push("--", opts.pattern, opts.path);

  return { command: "rg", args };
}

export function buildSearchFilesCommand(opts: RgSearchFilesOptions): RgCommand {
  const args: string[] = ["--color", "never"];

  if (opts.invertMatch) {
    args.push("--files-without-match");
  } else {
    args.push("-l");
  }

  appendCaseFlag(args, opts.caseSensitive);
  if (opts.fixedStrings) args.push("-F");
  if (opts.wordMatch) args.push("-w");
  appendTypeFlags(args, opts.fileType, opts.fileTypeNot);
  appendGlobFlag(args, opts.glob);
  appendHiddenFlag(args, opts.includeHidden);
  appendFollowFlag(args, opts.followSymlinks);
  appendMaxDepthFlag(args, opts.maxDepth);
  appendNoIgnoreFlag(args, opts.noIgnore);
  appendSortFlag(args, opts.sortBy);
  args.push("--", opts.pattern, opts.path);

  return { command: "rg", args };
}

export function buildListFilesCommand(opts: RgListFilesOptions): RgCommand {
  const args: string[] = ["--files", "--color", "never"];

  appendTypeFlags(args, opts.fileType, opts.fileTypeNot);
  appendGlobFlag(args, opts.glob);
  appendHiddenFlag(args, opts.includeHidden);
  appendFollowFlag(args, opts.followSymlinks);
  appendMaxDepthFlag(args, opts.maxDepth);
  appendNoIgnoreFlag(args, opts.noIgnore);
  appendSortFlag(args, opts.sortBy);
  args.push("--", opts.path);

  return { command: "rg", args };
}

export function buildListFileTypesCommand(): RgCommand {
  return { command: "rg", args: ["--type-list", "--color", "never"] };
}
