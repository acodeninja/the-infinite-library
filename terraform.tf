module "the-library" {
  source = "./infrastructure"
  name   = var.name
  stage  = var.stage
  title  = var.title
}

provider "aws" {
  region  = var.aws_region
  version = "~> 2.56"
}

variable "aws_region" {
  description = "The application title"
  default     = "eu-west-2"
  type        = string
}

variable "title" {
  description = "The application title"
  type        = string
}

variable "name" {
  description = "The application name (kebab-case)"
  type        = string
}

variable "stage" {
  description = "The deployment stage"
  default     = "dev"
  type        = string
}
