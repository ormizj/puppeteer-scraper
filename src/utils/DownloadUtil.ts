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

  // handle paths
  generateDirectory(downloadPath);
  const fullPath = path.join(
    downloadPath,
    `${downloadName}.${downloadExtension}`,
  );

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(fullPath, buffer);
};

export const generateDirectory = (directoryPath: string): boolean => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    return true;
  }
  return false;
};

export const removeEmptyDirectory = (directoryPath: string): boolean => {
  if (!fs.existsSync(directoryPath)) {
    return false;
  }
  const files = fs.readdirSync(directoryPath);
  if (files.length) return false;
  fs.rmdirSync(directoryPath);
  return true;
};
