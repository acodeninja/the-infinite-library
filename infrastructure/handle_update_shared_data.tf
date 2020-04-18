module "handle_update_shared_data" {
  source            = "./modules/handler"
  app_name          = var.name
  app_stage         = var.stage
  name              = "handle-update-shared-data"
  handler           = "handler.handleUpdateSharedData"
  runtime           = "nodejs12.x"
  execution_timeout = 300
  memory_size       = 512
  file = {
    path = "${path.cwd}/build/handler.zip"
    hash = filebase64sha256("${path.cwd}/build/handler.zip")
  }
}

resource "aws_iam_role_policy_attachment" "handle_update_shared_data" {
  for_each = {
    reading_uploads_bucket = aws_iam_policy.allow_reading_uploads_bucket.arn
    reading_books_table    = aws_iam_policy.allow_reading_books_table.arn
    writing_data_bucket    = aws_iam_policy.allow_writing_public_bucket.arn
    reading_settings_param = aws_iam_policy.allow_reading_settings_param.arn
  }
  role       = module.handle_update_shared_data.execution_role.name
  policy_arn = each.value
}
