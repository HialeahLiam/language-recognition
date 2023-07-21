import boto3
import requests


def lambda_handler(event, context):
    # print("event:", event)

    s3 = boto3.client("s3")

    bucketName, objectKey = (
        event["Records"][0]["s3"]["bucket"]["name"],
        event["Records"][0]["s3"]["object"]["key"],
    )

    url = "https://language-recognition.vercel.app/api/transcribe"  # Replace with the actual URL you want to send the request to

    print({"objectKey": objectKey})
    response = requests.post(url)

    return {
        "statusCode": 200,
        "body": {
            "message": "Transcribe endpoint hit successfully!",
            "objectKey": objectKey,
        },
    }
