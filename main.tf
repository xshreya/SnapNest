resource "aws_dynamodb_table" "s3_details" {
  name="s3_bucket-details"
  hash_key = "id"
   billing_mode = "PAY_PER_REQUEST"
    attribute {
    name = "id"
    type = "S"
  }
  #   attribute {
  #   name = "bucket_name"
  #   type = "S"
  # }
  #  attribute {
  #   name = "object_key"
  #   type = "S"
  # }
  #  attribute {
  #   name = "event_timestamp"
  #   type = "S"
  # }
  #  attribute {
  #   name = "processing_timestamp"
  #   type = "S"
  # }

}
#BUCKET-CREATION
resource "aws_s3_bucket" "bucket" {
  bucket = "snapest-bucket"
}

#ROLE
resource "aws_iam_role" "lambda_role" {
  name="Lamba-SnapNest-Role"
  assume_role_policy = <<EOF
{
    "Version":"2012-10-17",
    "Statement":[
        {
            "Action":"sts:AssumeRole",
            "Principal":{
             "Service": "lambda.amazonaws.com"
                },
            "Effect":"Allow"
        }
    ]
}
EOF
}

resource "aws_lambda_permission" "s3_trigger" {
  statement_id  = "AllowS3Invocation"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.Lambda_SnapNest.function_name

  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.bucket.arn
}



resource "aws_iam_policy" "lambda_policy" {
    name   = "LambdaPolicyForSnapNest"
    path= "/"
    policy = jsonencode(
{
        "Version":"2012-10-17",
        "Statement":[
          {
          "Effect"    : "Allow"
        "Action"   : [
          "*"
        ]
        "Resource" :["*"]
            },
            {
              "Effect": "Allow"
                "Action":[
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource":"arn:aws:logs:*:*:*"
            }
            
        ]
  })
}   

resource "aws_iam_role_policy_attachment" "attach_role_policy" {
    role = aws_iam_role.lambda_role.name
    policy_arn= aws_iam_policy.lambda_policy.arn
}

data "archive_file" "zip_py-file"{
    type = "zip"
    source_dir = "${path.module}/python/"
    output_path = "${path.module}/python/lambda.zip"
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.bucket.bucket
  lambda_function {
    lambda_function_arn = aws_lambda_function.Lambda_SnapNest.arn
    events = [ "s3:ObjectCreated:*","s3:ObjectRemoved:*"]
  }
  }


resource "aws_lambda_function" "Lambda_SnapNest" {
filename = "${path.module}/python/lambda.zip"
function_name = "lambda_SnapNest"
role=aws_iam_role.lambda_role.arn
handler = "lambda.lambda_handler" //pythonfile-function inside python file
runtime = "python3.8"
depends_on = [ aws_iam_role_policy_attachment.attach_role_policy ]

environment {
  variables = {
    dynamo_table_name = aws_dynamodb_table.s3_details.name
}
}
}

