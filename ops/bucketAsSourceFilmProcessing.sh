BUCKET_NAME=language-bucket-liam-idrovo
STACK_NAME=language-stack

FUNCARN=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs[?OutputKey==`FilmProcessingFunctionArn`].OutputValue' \
  --output text \
)
FUNCROLE=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs[?OutputKey==`FilmProcessingFunctionRole`].OutputValue' \
  --output text \
)

echo $FUNCROLE



echo $BUCKET_NAME

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

LAMBDA_POLICY_JSON=$(cat <<-EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowListObjectVersions",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucketVersions"
            ],
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME"
            ]
        }
    ]
}
EOF
)

echo $JSON

aws s3api \
  put-bucket-notification-configuration \
  --bucket="$BUCKET_NAME" \
  --notification-configuration "$JSON" \
  --region "us-east-1"

aws iam attach-role-policy \
  --role-name $FUNCROLE \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess




  