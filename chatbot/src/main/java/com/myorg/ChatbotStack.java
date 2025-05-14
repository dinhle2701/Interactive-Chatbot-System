package com.myorg;

import software.amazon.awscdk.CfnOutput;
import software.amazon.awscdk.services.cloudfront.*;
import software.amazon.awscdk.services.cognito.SignInAliases;
import software.amazon.awscdk.services.cognito.UserPool;
import software.amazon.awscdk.services.cognito.UserPoolClient;
import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.s3.Bucket;
import software.constructs.Construct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;

import java.util.Arrays;
// import software.amazon.awscdk.Duration;
// import software.amazon.awscdk.services.sqs.Queue;

public class ChatbotStack extends Stack {
    public ChatbotStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public ChatbotStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        // S3 bucket
        Bucket bucket = Bucket.Builder.create(this, "MyChatbotBucket")
                .bucketName("chatbot-system-s3-bucket")
                .versioned(true)
                .build();

        // CloudFront distribution
        OriginAccessIdentity oai = OriginAccessIdentity.Builder.create(this, "OAI")
                .comment("Access S3 via CloudFront")
                .build();
        CloudFrontWebDistribution distribution = CloudFrontWebDistribution.Builder.create(this, "MyChatbotDistribution")
                .originConfigs(Arrays.asList(
                        SourceConfiguration.builder()
                                .s3OriginSource(S3OriginConfig.builder()
                                        .s3BucketSource(bucket)
                                        .build())
                                .behaviors(Arrays.asList(Behavior.builder()
                                        .isDefaultBehavior(true)
                                        .build()))
                                .build()))
                .defaultRootObject("index.html")
                .build();

        // DynamoDB table
        Table table = Table.Builder.create(this, "MyChatbotTable")
                .tableName("chatbot-system-dynamo-table")
                .partitionKey(Attribute.builder()
                        .name("userId")
                        .type(AttributeType.STRING)
                        .build())
                .build();

        // Cognito User Pool
        UserPool userPool = UserPool.Builder.create(this, "MyChatbotUserPool")
                .userPoolName("chatbot-system-user-pool")
                .selfSignUpEnabled(true)
                .signInAliases(SignInAliases.builder().email(true).build())
                .build();

        // Cognito Identity Pool
        UserPoolClient userPoolClient = UserPoolClient.Builder.create(this, "MyChatbotUserPoolClient")
                .userPool(userPool)
                .generateSecret(false)
//                .callbackUrls(Arrays.asList("http://localhost:3000"))
//                .logoutUrls(Arrays.asList("http://localhost:3000"))
                .build();

        // Outputs
        // Output the S3 bucket name
        CfnOutput.Builder.create(this, "S3BucketName")
                .description("The name of the S3 bucket")
                .value(bucket.getBucketName())
                .build();

        // Output the CloudFront distribution domain name
        CfnOutput.Builder.create(this, "CloudFrontDomainName")
                .description("The domain name of the CloudFront distribution")
                .value(distribution.getDistributionDomainName())
                .build();

        // Output the DynamoDB table name
        CfnOutput.Builder.create(this, "DynamoDBTableName")
                .description("The name of the DynamoDB table")
                .value(table.getTableName())
                .build();

        // Output the Cognito User Pool ID
        CfnOutput.Builder.create(this, "CognitoUserPoolId")
                .description("The ID of the Cognito User Pool")
                .value(userPool.getUserPoolId())
                .build();

        // Output the Cognito User Pool Client ID
        CfnOutput.Builder.create(this, "CognitoUserPoolClientId")
                .description("The ID of the Cognito User Pool Client")
                .value(userPoolClient.getUserPoolClientId())
                .build();
    }
}
