import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import sharp from "sharp";
import { db } from "@/db";

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
      const path = `/uploads/${fileToStore.name}`;
      const filePath = `${uploadsDir}/${fileToStore.name}`;

      // get file buffer
      const bytes = await fileToStore.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write the file to the uploads directory
      await fs.writeFile(filePath, buffer);

      const imgMetaData = await sharp(bytes).metadata();
      const { width, height } = imgMetaData;

      const configuration = await db.configuration.create({
        data: {
          imageUrl: path,
          height: height || 500,
          width: width || 500,
        },
      });
      return NextResponse.json({ configId: configuration.id }, { status: 201 });
    } catch (error) {
      console.error("Error uploading file:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }
  } else {
    // Method Not Allowed
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
};

const croppedImagesDir = uploadsDir + "/croppedImages";

fs.mkdir(croppedImagesDir, { recursive: true }).catch((err) => {
  console.error("Error creating uploads directory:", err);
});

export const PUT = async (req: NextRequest) => {
  if (req.method === "PUT") {
    try {
      const formData = await req.formData();
      const configId = formData.get("configId") as string;

      // Handle file upload
      const files = formData.getAll("files") as File[];
      const fileToStore = files[0];

      const path = `/uploads/croppedImages/${fileToStore.name}`;
      const filePath = `${croppedImagesDir}/${fileToStore.name}`;

      // get file buffer
      const bytes = await fileToStore.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write the file to the uploads directory
      await fs.writeFile(filePath, buffer);

      const updatedConfiguration = await db.configuration.update({
        where: {
          id: configId,
        },
        data: {
          croppedImageUrl: path,
        },
      });
      return NextResponse.json(
        { configId: updatedConfiguration.id },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }
  } else {
    // Method Not Allowed
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
};
