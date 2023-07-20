import boto3
import ffmpeg
import requests


def lambda_handler(event, context):
    # print("event:", event)

    # objectKey = event["Records"][0]["s3"]["object"]["key"]
    url = "http://localhost:3000/api/transcribe"  # Replace with the actual URL you want to send the request to

    data = {"key1": "value1", "key2": "value2"}

    response = requests.post(url, data=data)

    return {
        "statusCode": 200,
        "body": {
            "message": "File uploaded successfully",
        },
    }

    # Create an S3 client
    s3_client = boto3.client("s3")

    # Get the file from the request body
    file_content = event["body"]

    # Upload the file to S3
    s3_client.put_object(Body=file_content, Bucket=s3_bucket_name, Key="example.mp4")

    return {"statusCode": 200, "body": "File uploaded successfully"}


print("ran")
