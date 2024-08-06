import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";

// Define the storage path
const uploadsDir = "public/uploads";

// Create the uploads directory if it doesn't exist
fs.mkdir(uploadsDir, { recursive: true }).catch((err) => {
  console.error("Error creating uploads directory:", err);
});

export const POST = async (req: NextRequest) => {
  if (req.method === "POST") {
    try {
      const formData = await req.formData();
      // Handle file upload
      const files = formData.getAll("files") as File[];
      const fileToStore = files[0];
      const filePath = `${uploadsDir}/${fileToStore.name}`;

      // get file buffer
      const bytes = await fileToStore.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write the file to the uploads directory
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({ success: true, path: filePath });
    } catch (error) {
      console.error("Error uploading file:", error);
      return NextResponse.json({ error: "Failed to upload file" });
    }
  } else {
    // Method Not Allowed
    return NextResponse.json({ error: "Method not allowed" });
  }
};
