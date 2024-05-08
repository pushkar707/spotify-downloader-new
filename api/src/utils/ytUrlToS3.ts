import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import ytdl from "ytdl-core"
import streamBuffers from "stream-buffers"

// Create a readable stream from the YouTube video
export default async (videoUrl: string, spotifyId: string) => {
    const awsRegion = process.env.AWS_REGION; // e.g., 'us-west-2'
    const bucketName = process.env.AWS_BUCKET_NAME;

    const s3Client = new S3Client({
        region: awsRegion,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY || '',
            secretAccessKey: process.env.AWS_SECRET_KEY || '',
        },
    });

    if (!videoUrl)
        throw new Error("Link not found")
    console.log(videoUrl);

    // const audioStream = ytdl(videoUrl, { quality: 'highestaudio' });
    const writeableStreamBuffer = new streamBuffers.WritableStreamBuffer({
        initialSize: (1024 * 1024), // Start with a 1MB buffer
        incrementAmount: (100 * 1024), // Increment by 100KB as needed
    });

    // Download the YouTube audio to the buffer
    ytdl(videoUrl, { quality: 'highestaudio' }).pipe(writeableStreamBuffer);
    return new Promise((resolve, reject) => {
        writeableStreamBuffer.on('finish', async () => {
            try {
                const body = writeableStreamBuffer.getContents();
                if (!body) {
                    resolve("No body");
                    return;
                }

                const uploadParams = {
                    Bucket: bucketName,
                    Key: spotifyId,
                    Body: body,
                    ContentType: 'audio/mpeg',
                };

                const uploadCommand = new PutObjectCommand(uploadParams);
                await s3Client.send(uploadCommand);

                resolve(spotifyId); // Resolve with a successful upload
            } catch (error) {
                reject(error); // Reject with an error
            }
        });

        writeableStreamBuffer.on('error', (error) => {
            reject(error); // Handle stream errors
        });
    });
}
