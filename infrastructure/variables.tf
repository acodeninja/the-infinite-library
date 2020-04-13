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

locals {
  kebab-prefix = "${var.name}-${var.stage}"
  slash-prefix = "${var.name}/${var.stage}"
}
