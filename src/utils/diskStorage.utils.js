import fs from "fs";
import path from "path";

const uploadOnDisk = async (localFilePath, userId, fileType) => {
  try {
    if (!localFilePath || !userId || !fileType) {
      return null;
    }

    console.log("\nUploading file to Private Cloud...0%\n");

    // create final directory
    const finalDir = path.join(
      "uploads",
      String(userId),
      fileType
    );

    fs.mkdirSync(finalDir, { recursive: true });

    const fileName = path.basename(localFilePath);
    const finalPath = path.join(finalDir, fileName);

    // move file
    fs.renameSync(localFilePath, finalPath);

    console.log("File uploaded to Private Cloud 100%\n");

    return {
      fileName,
      filePath: finalPath,
      fileType,
    };
  } catch (error) {
    console.error("Error uploading to Private Cloud:", error);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

/**
 * Delete file from PRIVATE CLOUD
 */
const deleteFromDisk = async (filePath) => {
  try {
    if (!filePath) return null;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return { deleted: true };
  } catch (error) {
    console.error("Error deleting from Private Cloud:", error);
    return null;
  }
};

export {
  uploadOnDisk,
  deleteFromDisk
};
