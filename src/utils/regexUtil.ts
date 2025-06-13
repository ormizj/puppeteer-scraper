const INVALID_FOLDER_CHARS = /[<>:"|?*\/\\\x00-\x1f.]/g;
const INVALID_FILE_CHARS = /[<>:"|?*]/g;

export const sanitizeFolderName = (name: string): string => {
  return name.replace(INVALID_FOLDER_CHARS, "");
};

export const testInvalidFolderName = (name: string): boolean => {
  if (INVALID_FOLDER_CHARS.test(name)) return false;
  return invalidName(name);
};

export const testInvalidFileName = (name: string): boolean => {
  if (INVALID_FILE_CHARS.test(name)) return false;
  return invalidName(name);
};

const invalidName = (name: string): boolean => {
  // reserved names
  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ];
  const baseName = name.split(".")[0].toUpperCase();
  if (reservedNames.includes(baseName)) {
    return false;
  }
  // empty
  if (!name || name.trim().length === 0) {
    return false;
  }
  // control characters
  if (/[\x00-\x1f]/.test(name)) {
    return false;
  }
  // invalid endings
  if (name.endsWith(" ") || name.endsWith(".")) {
    return false;
  }
  // name only dots
  if (/^\.+$/.test(name)) {
    return false;
  }
  // length
  return name.length <= 255;
};
