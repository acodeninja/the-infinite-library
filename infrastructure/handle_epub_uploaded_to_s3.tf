module "handle_epub_uploaded_to_s3" {
  source            = "./modules/handler"
  app_name          = var.name
  app_stage         = var.stage
  name              = "handle-epub-uploaded-to-s3"
  handler           = "handler.handleEPubUploadedToS3"
  runtime           = "nodejs12.x"
  execution_timeout = 120
  file = {
    path = "${path.cwd}/build/handler.zip"
    hash = filebase64sha256("${path.cwd}/build/handler.zip")
  }
}

resource "aws_lambda_permission" "allow_uploads_to_trigger_handle_epub_upload" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = module.handle_epub_uploaded_to_s3.function.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.uploads.arn
}

resource "aws_s3_bucket_notification" "epub_uploaded" {
  bucket = aws_s3_bucket.uploads.id

  lambda_function {
    lambda_function_arn = module.handle_epub_uploaded_to_s3.function.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "uploads/"
    filter_suffix       = ".epub"
  }

  depends_on = [aws_lambda_permission.allow_uploads_to_trigger_handle_epub_upload]
}

resource "aws_iam_role_policy_attachment" "allow_epub_upload_reading_uploads_bucket" {
  role       = module.handle_epub_uploaded_to_s3.execution_role.name
  policy_arn = aws_iam_policy.allow_reading_uploads_bucket.arn
}

resource "aws_iam_role_policy_attachment" "allow_epub_upload_writing_books_bucket" {
  role       = module.handle_epub_uploaded_to_s3.execution_role.name
  policy_arn = aws_iam_policy.allow_writing_books_bucket.arn
}

resource "aws_iam_role_policy_attachment" "allow_epub_upload_reading_books_bucket" {
  role       = module.handle_epub_uploaded_to_s3.execution_role.name
  policy_arn = aws_iam_policy.allow_reading_books_bucket.arn
}

resource "aws_iam_role_policy_attachment" "allow_epub_upload_reading_books_table" {
  role       = module.handle_epub_uploaded_to_s3.execution_role.name
  policy_arn = aws_iam_policy.allow_reading_books_table.arn
}

resource "aws_iam_role_policy_attachment" "allow_epub_upload_writing_books_table" {
  role       = module.handle_epub_uploaded_to_s3.execution_role.name
  policy_arn = aws_iam_policy.allow_writing_books_table.arn
}

resource "aws_iam_role_policy_attachment" "allow_epub_upload_read_settings_param" {
  role       = module.handle_epub_uploaded_to_s3.execution_role.name
  policy_arn = aws_iam_policy.allow_reading_settings_param.arn
}
