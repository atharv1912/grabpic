import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2.js";

export const uploadToR2 = async (fileBuffer, filename , contentType) => {
    await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: filename,
        Body: fileBuffer,
        ContentType: contentType,
    }));
    return `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ENDPOINT}/${filename}`;
};

export const deleteFromR2 = async (filename) => {
    await r2.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: filename,
    }));
};
