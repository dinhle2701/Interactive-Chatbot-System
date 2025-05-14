package com.myorg;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Environment;
import software.amazon.awscdk.StackProps;

import java.util.Arrays;

public class ChatbotApp {
    public static void main(final String[] args) {
        App app = new App();

        new ChatbotStack(app, "ChatbotStack", StackProps.builder()
                .env(Environment.builder()
                        .account("851725458360")
                        .region("us-east-1")
                        .build())
                .build());

        app.synth();
    }
}

