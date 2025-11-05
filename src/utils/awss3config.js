const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_PASSWORD,
  region: process.env.S3_REGION,
});

const s3 = new AWS.S3();

const uploadFile = async (file, key) => {
  try {
    if (file) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key || `${Date.now()}`,
        Body: file.data,
        ContentType: file.mimetype,
        Metadata: {
          displayName: file.name,
        },
      };
      const response = await s3.upload(params).promise();
      return { location: response.Location, fileKey: params.Key };
    }
  } catch (error) {
    throw error;
  }
};

const removeFile = async (key) => {
  try {
    if (key) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      };
      await s3.deleteObject(params).promise();
    }
  } catch (error) {
    throw error;
  }
};

module.exports = { uploadFile, removeFile };

// 🔍 Test connection by listing your buckets
// async function testS3Connection() {
//   try {
//     const data = await s3.listBuckets().promise();
//     console.log("✅ S3 connection successful!");
//     console.log(
//       "Buckets:",
//       data.Buckets.map((b) => b.Name)
//     );
//   } catch (error) {
//     console.error("❌ S3 connection failed:", error.message);
//   }
// }

// testS3Connection();

// module.exports = s3;
