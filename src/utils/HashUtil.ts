import { createHash } from "crypto";

export const createSha256Base64UrlHash = (input: string): string => {
  return createHash("sha256").update(input).digest("base64url");
};
