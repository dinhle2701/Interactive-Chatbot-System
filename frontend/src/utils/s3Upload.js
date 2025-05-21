import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({
    region: process.env.REACT_APP_REGION,
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
});

export async function uploadToS3(file) {
    const bucketName = process.env.REACT_APP_AWS_S3_BUCKET;
    const fileName = `uploads/${Date.now()}_${file.name}`;

    try {
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: fileName,
                Body: file,
                ContentType: file.type,
            },
            queueSize: 4,  // số phần upload đồng thời
            partSize: 5 * 1024 * 1024, // mỗi phần 5MB
            leavePartsOnError: false,
        });

        await upload.done();

        return {
            Key: fileName,
            Bucket: bucketName,
        };
    } catch (err) {
        console.error("Error uploading file:", err);
        throw err;
    }
}
