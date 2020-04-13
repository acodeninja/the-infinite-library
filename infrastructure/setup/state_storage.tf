variable "stage" {
  description = "The deployment stage"
  default     = "dev"
  type        = string
}

variable "name" {
  description = "The application name (kebab-case)"
  type        = string
}

locals {
  state_name = "${var.name}-${var.stage}"
}

resource "aws_s3_bucket" "state" {
  bucket = "${local.state_name}-tfstate"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_dynamodb_table" "state_lock" {
  name           = "${local.state_name}-state"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
