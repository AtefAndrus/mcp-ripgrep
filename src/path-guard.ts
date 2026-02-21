import path from "node:path";

export function validatePath(
  requestedPath: string,
  allowedDirs?: string[],
): void {
  if (!allowedDirs || allowedDirs.length === 0) {
    return;
  }

  const resolved = path.resolve(requestedPath);

  const allowed = allowedDirs.some((dir) => {
    const normalizedDir = path.resolve(dir);
    return (
      resolved === normalizedDir ||
      resolved.startsWith(normalizedDir + path.sep)
    );
  });

  if (!allowed) {
    throw new Error(
      `Path "${resolved}" is outside allowed directories: ${allowedDirs.join(", ")}`,
    );
  }
}
