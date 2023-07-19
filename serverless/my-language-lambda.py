import boto3


def lambda_handler(event, context):
    s3_bucket_name = "your-s3-bucket-name"  # Replace with your S3 bucket name

    # Create an S3 client
    s3_client = boto3.client("s3")

    # Get the file from the request body
    file_content = event["body"]

    # Upload the file to S3
    s3_client.put_object(Body=file_content, Bucket=s3_bucket_name, Key="example.mp4")

    return {"statusCode": 200, "body": "File uploaded successfully"}


print("ran")
