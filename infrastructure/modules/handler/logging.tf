resource "aws_cloudwatch_log_group" "handler" {
  name              = "/aws/lambda/${var.app_name}-${var.app_stage}-${var.name}"
  retention_in_days = 7

  tags = {
    Name  = var.app_name
    Stage = var.app_stage
  }
}

resource "aws_iam_policy" "logging_policy" {
  name   = "${local.kebab-prefix}-${var.name}-logging-policy"
  policy = data.aws_iam_policy_document.logging_policy.json
}

data "aws_iam_policy_document" "logging_policy" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [aws_cloudwatch_log_group.handler.arn]
  }
}

resource "aws_iam_role_policy_attachment" "logging_policy" {
  role       = aws_iam_role.execution_role.name
  policy_arn = aws_iam_policy.logging_policy.arn
}
