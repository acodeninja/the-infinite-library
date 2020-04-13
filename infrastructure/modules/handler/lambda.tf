resource "aws_lambda_function" "function" {
  function_name    = "${var.app_name}-${var.app_stage}-${var.name}"
  handler          = var.handler
  role             = aws_iam_role.execution_role.arn
  runtime          = var.runtime
  filename         = var.file.path
  source_code_hash = var.file.hash
  memory_size      = 512
  timeout          = var.execution_timeout

  environment {
    variables = {
      APP_NAME  = var.app_name
      APP_STAGE = var.app_stage
    }
  }

  tags = {
    Name  = var.app_name
    Stage = var.app_stage
  }

  depends_on = [
    aws_iam_role_policy_attachment.logging_policy,
    aws_cloudwatch_log_group.handler,
  ]
}
