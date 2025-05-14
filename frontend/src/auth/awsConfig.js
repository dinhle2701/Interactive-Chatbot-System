// src/aws-config.js

export const awsConfig = {
    Auth: {
        region: process.env.region, // hoặc region bạn đã tạo Cognito
        userPoolId: process.env.USER_POOL_ID, // lấy từ CDK output hoặc AWS Console
        userPoolWebClientId: process.env.USER_POOL_WEB_CLIENT_ID, // app client id
    }
};
