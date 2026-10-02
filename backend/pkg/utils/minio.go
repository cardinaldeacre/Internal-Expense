package utils

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func UploadToMinIO(file *multipart.FileHeader) (string, error) {
	ctx := context.TODO()
	endpoint := os.Getenv("MINIO_ENDPOINT")
	bucketName := os.Getenv("MINIO_BUCKET_NAME")
	accessKey := os.Getenv("MINIO_ROOT_USER")
	secretKey := os.Getenv("MINIO_ROOT_PASSWORD")

	cfg, err := awsConfig.LoadDefaultConfig(ctx,
		awsConfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		awsConfig.WithRegion("us-east-1"),
	)
	if err != nil {
		return "", fmt.Errorf("failed to load S3 config: %v", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("http://%s", endpoint))
		o.UsePathStyle = true
	})

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	fileName := fmt.Sprintf("receipts/%d_%s", time.Now().UnixNano(), file.Filename)

	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(fileName),
		Body:        src,
		ContentType: aws.String(file.Header.Get("Content-Type")),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload to minio: %v", err)
	}

	return fmt.Sprintf("http://localhost:9000/%s/%s", bucketName, fileName), nil
}
