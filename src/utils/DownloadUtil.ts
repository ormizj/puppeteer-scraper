import fs from "fs";
import path from "path";

/**
 * @private
 * @param downloadUrl
 * @param downloadPath
 * @param downloadName
 * @param downloadExtension
 * @throws Error if download failed
 */
export const downloadFromUrl = async (
  downloadUrl: string,
  downloadPath: string,
  downloadName: string,
  downloadExtension: string,
) => {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // ensure directory exists
  const dir = path.dirname(downloadPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fullPath = path.join(
    downloadPath,
    `${downloadName}.${downloadExtension}`,
  );
  fs.writeFileSync(fullPath, buffer);
  console.log(`Image downloaded: ${fullPath}`);
};
