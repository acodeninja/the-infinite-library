variable "aws_region" {
  description = "The AWS region the application will be deployed to"
  type        = string
}

provider "aws" {
  region  = var.aws_region
  version = "~> 2.56"
}
