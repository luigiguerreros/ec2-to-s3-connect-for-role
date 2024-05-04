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
            return 'application/octet-stream'; // Tipo genérico para archivos binarios
    }
}

async function assumeRoleAndExecuteActions(roleArn, sessionName) {
    const stsClient = new STSClient({ region });

    const params = {
        RoleArn: roleArn,
        RoleSessionName: sessionName,
        DurationSeconds: 3600,
    };

    try {
        const { Credentials } = await stsClient.send(new AssumeRoleCommand(params));
        console.log("Credentials received:", Credentials);
        return Credentials;
    } catch (err) {
        console.error("Error al asumir el rol", err);
        throw err;
    }
}

async function uploadFileToS3(bucket, fileName, filePath, credentials) {
    const s3Client = new S3Client({
        region,
        credentials
    });

    const fileStream = fs.createReadStream(filePath);
    const contentType = getContentType(fileName);

    const uploadParams = {
        Bucket: bucket,
        Key: fileName,
        Body: fileStream,
        ContentType: contentType
    };

    try {
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log('File uploaded successfully. Location:', data.Location);
    } catch (err) {
        console.error("Error al subir el archivo", err);
        throw err;
    }
}

const roleArnSocios = process.env.ROLE_ARN_SOCIOS;
const bucketSocios = process.env.BUCKET_SOCIOS;
const fileNameSocios = process.env.FILE_NAME_SOCIOS;
const filePathSocios = process.env.FILE_PATH_SOCIOS;

assumeRoleAndExecuteActions(roleArnSocios, "sesionFinancieraSocios")
    .then(credentials => uploadFileToS3(bucketSocios, fileNameSocios, filePathSocios, credentials))
    .catch(err => console.error(err));
