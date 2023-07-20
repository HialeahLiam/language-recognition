FUNCARN=$(aws cloudformation describe-stacks \
  --stack-name "language-recognition" \
  --query 'Stacks[0].Outputs[?OutputKey==`FilmProcessingFunctionArn`].OutputValue' \
  --output text \
)

JSON=$(cat <<-EOF
  {
    "LambdaFunctionConfigurations": [
      {
        "LambdaFunctionArn": "${FUNCARN}",
        "Events": [
          "s3:ObjectCreated:*"
        ]
      }
    ]
  }
EOF
)

echo $JSON

aws s3api \
  put-bucket-notification-configuration \
  --bucket="language-bucket-liam-idrovo" \
  --notification-configuration "$JSON" \
  --region "us-east-1"

  