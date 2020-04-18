variable "app_name" {
  description = "The application name (kebab-case)"
  type        = string
}

variable "app_stage" {
  description = "The deployment stage"
  default     = "dev"
  type        = string
}

variable "name" {
  description = "The name of the lambda handler"
  type        = string
}

variable "handler" {
  description = "The handlers path in the deployed codebase"
  type        = string
}

variable "runtime" {
  description = "The handlers lambda runtime"
  type        = string
}

variable "execution_timeout" {
  description = "The lambda invocation timeout"
  type        = number
}

variable "file" {
  description = "The path and hash of the deployed code"
  type = object({
    path = string
    hash = string
  })
}

variable "memory_size" {
  description = "The number of MB of RAM to give the lambda function"
  type        = number
  default     = 256
}

locals {
  kebab-prefix = "${var.app_name}-${var.app_stage}"
  slash-prefix = "${var.app_name}/${var.app_stage}"
}
