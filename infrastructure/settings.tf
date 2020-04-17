resource "aws_ssm_parameter" "settings" {
  name = "/${local.slash-prefix}/settings"
  type = "String"
  value = jsonencode({
    storage = {
      data = {
        books = {
          bucket = aws_s3_bucket.data.bucket
          key    = "public/data/books.json"
        }
      }
      books = {
        data = {
          table = aws_dynamodb_table.books.name
        }
        files = {
          bucket = aws_s3_bucket.books.bucket
          prefix = "public/"
        }
      }
    }
  })
}

resource "aws_iam_policy" "allow_reading_settings_param" {
  name   = "${local.kebab-prefix}-${var.name}-settings-param-read"
  policy = data.aws_iam_policy_document.allow_reading_settings_param.json
}

data "aws_iam_policy_document" "allow_reading_settings_param" {
  statement {
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
    ]
    resources = [aws_ssm_parameter.settings.arn]
  }
}
