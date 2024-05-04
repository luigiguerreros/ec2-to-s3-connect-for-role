# Proyecto de Subida de Archivos a Amazon S3

Este proyecto implementa una solución eficiente para subir archivos a un bucket de Amazon S3 utilizando credenciales temporales obtenidas mediante AWS Security Token Service (STS). El script permite asumir un rol de IAM específico con permisos limitados para realizar la subida, aumentando la seguridad al seguir el principio de mínimo privilegio.

## Características

- **Seguridad Mejorada**: Utiliza AWS STS para asumir roles temporalmente, lo que limita el uso de credenciales de larga duración en el código.
- **Gestión Eficiente de Credenciales**: Implementa un sistema de caché para las credenciales, reduciendo la cantidad de solicitudes a AWS STS y mejorando la eficiencia general.
- **Soporte para Múltiples Tipos de Archivos**: Determina automáticamente el tipo de contenido del archivo basado en su extensión, soportando JPEG, PNG y otros tipos de archivos binarios.

## Usar un Rol Separado en el Código

Al considerar cómo gestionar las credenciales de AWS en tu aplicación, una opción es utilizar un rol separado en el código. Esto implica asignar un rol específico de IAM a cada proyecto o servicio dentro del código fuente de la aplicación. A continuación, se presentan algunos pros y contras de este enfoque:

### Pros:

- **Seguridad Mejorada**: Asumir roles específicos para tareas específicas sigue el principio de menor privilegio, donde cada aplicación o servicio solo tiene acceso a los recursos que necesita para funcionar.
- **Flexibilidad**: Facilita la gestión de diferentes políticas de seguridad para diferentes proyectos o servicios sin cambiar la configuración de la instancia EC2 subyacente.
- **Aislamiento de Aplicaciones**: Si una aplicación se ve comprometida, los permisos están limitados al rol específico que esa aplicación asume, lo que potencialmente limita el daño.

### Contras:

- **Complejidad**: Requiere una configuración adicional en el código y gestión de múltiples roles de IAM, lo que puede añadir complejidad al desarrollo y mantenimiento.
- **Latencia**: El proceso de asumir un rol puede añadir una sobrecarga temporal a las operaciones, especialmente si se realiza frecuentemente.
  
## Configuración

Para utilizar este script, necesitarás configurar varias variables de entorno que el script utilizará para operar correctamente:

- `AWS_REGION`: La región de AWS donde se ejecutará el script.
- `ROLE_ARN_SOCIOS`: El ARN del rol de IAM que el script asumirá para obtener las credenciales necesarias para la subida de archivos.
- `BUCKET_SOCIOS`: El nombre del bucket de S3 donde se subirán los archivos.
- `FILE_NAME_SOCIOS`: El nombre del archivo que se subirá a S3.
- `FILE_PATH_SOCIOS`: La ruta local al archivo que se subirá.
- `PATH_DIR_S3`: La ruta dentro del bucket de S3 donde se guardará el archivo.
- `URI_BASE`: La base URI que se usará para construir la URL del archivo subido.

## Uso

Para ejecutar el script, simplemente navega al directorio del proyecto y ejecuta:

```bash
npm init -y

npm install @aws-sdk/client-s3
npm install @aws-sdk/client-s3 @aws-sdk/client-sts fs
npm install dotenv

node index.js
