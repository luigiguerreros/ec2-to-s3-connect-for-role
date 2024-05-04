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

    const params = {
        RoleArn: roleArn,
        RoleSessionName: sessionName,
        DurationSeconds: 3600,
    };

    try {
        const { Credentials } = await stsClient.send(new AssumeRoleCommand(params));
        console.log("Credentials Success");
        return Credentials;
    } catch (err) {
        console.error("Error al asumir el rol", err);
        throw err;
    }
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

    // Usa la variable de entorno para la ruta del directorio
    const key = `${process.env.PATH_DIR_S3}/${fileName}`;

    const fileStream = fs.createReadStream(filePath);
    const contentType = getContentType(fileName);

    const uploadParams = {
        Bucket: bucket,
        Key: key,
        Body: fileStream,
        ContentType: contentType
    };

    try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        const fileUrl = `${process.env.URI_BASE}/${encodeURIComponent(key)}`;
        console.log('File uploaded successfully. File URL:', fileUrl);
        return fileUrl; // Devuelve la URL para usar en otra parte si es necesario
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
