resource "aws_iam_role" "execution_role" {
  name               = "${local.kebab-prefix}-${var.name}-exec-role"
  assume_role_policy = data.aws_iam_policy_document.execution_assume_role_policy.json

  tags = {
    Name  = var.app_name
    Stage = var.app_stage
  }
}

data "aws_iam_policy_document" "execution_assume_role_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}
