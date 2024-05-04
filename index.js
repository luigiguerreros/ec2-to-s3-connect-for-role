require('dotenv').config();
const { STSClient, AssumeRoleCommand, S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');

const region = process.env.AWS_REGION;
let cachedCredentials = null;
let lastAssumeRoleTime = 0;

function getContentType(extension) {
    return {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png'
    }[extension.toLowerCase()] || 'application/octet-stream';
}

async function getCredentials(roleArn, sessionName) {
    if (!cachedCredentials || Date.now() - lastAssumeRoleTime > 840000) { // 14 minutes
        const stsClient = new STSClient({ region });
        const { Credentials } = await stsClient.send(new AssumeRoleCommand({
            RoleArn: roleArn,
            RoleSessionName: sessionName,
            DurationSeconds: 900
        }));
        cachedCredentials = Credentials;
        lastAssumeRoleTime = Date.now();
        console.log("Credentials successfully retrieved.");
    }
    return cachedCredentials;
}

async function uploadFile(bucket, fileName, filePath, credentials) {
    const s3Client = new S3Client({ region, credentials });
    const key = `${process.env.PATH_DIR_S3}/${fileName}`;
    const fileStream = fs.createReadStream(filePath);

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: fileStream,
            ContentType: getContentType(fileName.split('.').pop())
        }));
        console.log('File uploaded successfully. File URL:', `${process.env.URI_BASE}/${key}`);
    } catch (err) {
        console.error("Error during file upload:", err);
    }
}

async function main() {
    try {
        const credentials = await getCredentials(process.env.ROLE_ARN_SOCIOS, "sesionFinancieraSocios");
        await uploadFile(process.env.BUCKET_SOCIOS, process.env.FILE_NAME_SOCIOS, process.env.FILE_PATH_SOCIOS, credentials);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
