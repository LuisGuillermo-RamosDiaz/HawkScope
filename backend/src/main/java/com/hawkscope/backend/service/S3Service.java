package com.hawkscope.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.io.InputStream;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    /**
     * Uploads an object to S3 and returns the public URL.
     * Note: Accessing this URL requires the S3 bucket to be public,
     * or it must be replaced by a presigned URL generation method.
     */
    public String uploadFile(String keyName, InputStream inputStream, long contentLength, String contentType) throws IOException {
        try {
            PutObjectRequest putOb = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(keyName)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(putOb, RequestBody.fromInputStream(inputStream, contentLength));
            
            return "https://" + bucketName + ".s3.amazonaws.com/" + keyName;
            
        } catch (S3Exception e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage(), e);
        }
    }
}
