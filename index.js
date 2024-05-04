const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');

const region = "tu-region"; // Asegúrate de cambiar esto por tu región de AWS

async function assumeRoleAndExecuteActions(roleArn, sessionName) {
    const stsClient = new STSClient({ region });

    const params = {
        RoleArn: roleArn,
        RoleSessionName: sessionName,
        DurationSeconds: 3600, // La sesión dura 1 hora
    };

    try {
        const { Credentials } = await stsClient.send(new AssumeRoleCommand(params));
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

    const uploadParams = {
        Bucket: bucket,
        Key: fileName,
        Body: fileStream,
        ContentType: 'image/jpeg' // Ajusta según el tipo de archivo que estés subiendo
    };

    try {
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log('File uploaded successfully. Location:', data.Location);
    } catch (err) {
        console.error("Error al subir el archivo", err);
        throw err;
    }
}

// Ejemplo de uso
const roleArnSocios = "arn:aws:iam::account-id:role/rol-financiera-socios";
const bucketSocios = "bucket-A";
const fileNameSocios = "fileSocios.jpg";
const filePathSocios = "/path/to/fileSocios.jpg";

assumeRoleAndExecuteActions(roleArnSocios, "sesionFinancieraSocios")
    .then(credentials => uploadFileToS3(bucketSocios, fileNameSocios, filePathSocios, credentials))
    .catch(err => console.error(err));
