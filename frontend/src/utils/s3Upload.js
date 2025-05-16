import AWS from 'aws-sdk';

export async function uploadToS3(file, accessToken) {
  const region = process.env.NEXT_PUBLIC_REGION;
  const identityPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_CLIENT_ID;
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;

  if (!region || !identityPoolId || !userPoolId || !bucket) {
    throw new Error("Missing AWS environment variables.");
  }

  AWS.config.update({
    region,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: identityPoolId,
      Logins: {
        [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: accessToken,
      },
    }),
  });

  // chờ credentials được lấy
  await new Promise((resolve, reject) => {
    AWS.config.credentials.get(err => {
      if (err) reject(err);
      else resolve();
    });
  });

  const s3 = new AWS.S3({
    params: { Bucket: bucket },
    region,
  });

  const fileKey = `${Date.now()}-${file.name}`;
  const params = {
    Key: fileKey,
    Body: file,
    ContentType: file.type,
    ACL: 'private',
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult;
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw err;
  }
}
