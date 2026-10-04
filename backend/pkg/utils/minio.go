package utils

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func getS3Client() (*s3.Client, string, error) {
	ctx := context.TODO()

	endpoint := os.Getenv("MINIO_ENDPOINT")
	bucketName := os.Getenv("MINIO_BUCKET_NAME")
	accessKey := os.Getenv("MINIO_ROOT_USER")
	secretKey := os.Getenv("MINIO_ROOT_PASSWORD")

	if bucketName == "" {
		bucketName = "expense-receipts"
	}

	cfg, err := awsConfig.LoadDefaultConfig(
		ctx,
		awsConfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				accessKey,
				secretKey,
				"",
			),
		),
		awsConfig.WithRegion("us-east-1"),
	)

	if err != nil {
		return nil, "", fmt.Errorf(
			"failed to load S3 config: %w",
			err,
		)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(
			fmt.Sprintf("http://%s", endpoint),
		)
		o.UsePathStyle = true
	})

	return client, bucketName, nil
}

func InitMinIOBucket() {
	ctx := context.TODO()
	client, bucketName, err := getS3Client()
	if err != nil {
		log.Printf("[MinIO] Gagal menginisialisasi client: %v\n", err)
		return
	}

	_, err = client.HeadBucket(ctx, &s3.HeadBucketInput{
		Bucket: aws.String(bucketName),
	})

	if err != nil {
		log.Printf("[MinIO] Bucket '%s' tidak ditemukan, membuat bucket baru...\n", bucketName)
		_, createErr := client.CreateBucket(ctx, &s3.CreateBucketInput{
			Bucket: aws.String(bucketName),
		})
		if createErr != nil {
			log.Fatalf("[MinIO] Gagal membuat bucket secara otomatis: %v\n", createErr)
		}
		log.Printf("[MinIO] Bucket '%s' berhasil dibuat secara otomatis!\n", bucketName)
	} else {
		log.Printf("[MinIO] Bucket '%s' sudah tersedia.\n", bucketName)
	}
}

func UploadToMinIO(file *multipart.FileHeader) (string, error) {
	ctx := context.TODO()
	client, bucketName, err := getS3Client()
	if err != nil {
		return "", err
	}

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	objectKey := fmt.Sprintf("receipts/%d_%s", time.Now().UnixNano(), file.Filename)

	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(objectKey),
		Body:        src,
		ContentType: aws.String(file.Header.Get("Content-Type")),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload to minio: %v", err)
	}

	return objectKey, nil
}

func GetFileFromMinIO(objectKey string) (io.ReadCloser, int64, string, error) {
	ctx := context.TODO()

	client, bucketName, err := getS3Client()
	if err != nil {
		return nil, 0, "", err
	}

	output, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})

	if err != nil {
		log.Printf("[MinIO] GetObject failed: %v", err)

		return nil, 0, "", fmt.Errorf(
			"failed to get object from minio: %w",
			err,
		)
	}

	if output == nil {
		return nil, 0, "", fmt.Errorf(
			"minio returned nil output",
		)
	}

	if output.Body == nil {
		return nil, 0, "", fmt.Errorf(
			"minio returned nil body",
		)
	}

	contentType := "application/octet-stream"

	if output.ContentType != nil {
		contentType = *output.ContentType
	}

	var contentLength int64

	if output.ContentLength != nil {
		contentLength = *output.ContentLength
	}

	log.Printf(
		"[MinIO] Success: key=%s type=%s size=%d",
		objectKey,
		contentType,
		contentLength,
	)

	return output.Body, contentLength, contentType, nil
}
