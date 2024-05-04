require('dotenv').config();
const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');

const region = process.env.AWS_REGION;

function getContentType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        default:
            return 'application/octet-stream'; // Tipo genérico para binarios
    }
}

async function assumeRoleAndExecuteActions(roleArn, sessionName) {
    const stsClient = new STSClient({ region });
    const params = { RoleArn: roleArn, RoleSessionName: sessionName, DurationSeconds: 3600 };
    const { Credentials } = await stsClient.send(new AssumeRoleCommand(params));
    console.log("Credentials successfully retrieved.");
    return Credentials;
}

async function uploadFileToS3(bucket, fileName, filePath, credentials) {
    const s3Client = new S3Client({
        region,
        credentials: {
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken
        }
    });

    const key = `${process.env.PATH_DIR_S3}/${fileName}`;
    const fileStream = fs.createReadStream(filePath);
    const contentType = getContentType(fileName);

    const uploadParams = {
        Bucket: bucket,
        Key: key,
        Body: fileStream,
        ContentType: contentType
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    return `${process.env.URI_BASE}/${key}`;
}

async function main() {
    try {
        const credentials = await assumeRoleAndExecuteActions(process.env.ROLE_ARN_SOCIOS, "sesionFinancieraSocios");
        const fileUrl = await uploadFileToS3(process.env.BUCKET_SOCIOS, process.env.FILE_NAME_SOCIOS, process.env.FILE_PATH_SOCIOS, credentials);
        console.log('File uploaded successfully. File URL:', fileUrl);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
