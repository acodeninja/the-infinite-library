resource "aws_s3_bucket" "data" {
  bucket = "${local.kebab-prefix}-data"

  tags = {
    Name  = var.name
    Stage = var.stage
  }
}

resource "aws_iam_policy" "allow_reading_data_bucket" {
  name   = "${local.kebab-prefix}-${var.name}-data-bucket-read"
  policy = data.aws_iam_policy_document.allow_reading_data_bucket.json
}

data "aws_iam_policy_document" "allow_reading_data_bucket" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
    ]
    resources = ["${aws_s3_bucket.data.arn}/*", aws_s3_bucket.data.arn]
  }
}

resource "aws_iam_policy" "allow_writing_data_bucket" {
  name   = "${local.kebab-prefix}-${var.name}-data-bucket-write"
  policy = data.aws_iam_policy_document.allow_writing_data_bucket.json
}

data "aws_iam_policy_document" "allow_writing_data_bucket" {
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
    ]
    resources = ["${aws_s3_bucket.data.arn}/*", aws_s3_bucket.data.arn]
  }
}

resource "aws_s3_bucket" "uploads" {
  bucket = "${local.kebab-prefix}-uploads"

  tags = {
    Name  = var.name
    Stage = var.stage
  }
}

resource "aws_iam_policy" "allow_reading_uploads_bucket" {
  name   = "${local.kebab-prefix}-${var.name}-uploads-bucket-read"
  policy = data.aws_iam_policy_document.allow_reading_uploads_bucket.json
}

data "aws_iam_policy_document" "allow_reading_uploads_bucket" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
    ]
    resources = ["${aws_s3_bucket.uploads.arn}/*", aws_s3_bucket.uploads.arn]
  }
}

resource "aws_iam_policy" "allow_writing_uploads_bucket" {
  name   = "${local.kebab-prefix}-${var.name}-uploads-bucket-write"
  policy = data.aws_iam_policy_document.allow_writing_uploads_bucket.json
}

data "aws_iam_policy_document" "allow_writing_uploads_bucket" {
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
    ]
    resources = ["${aws_s3_bucket.uploads.arn}/*", aws_s3_bucket.uploads.arn]
  }
}

resource "aws_s3_bucket" "books" {
  bucket = "${local.kebab-prefix}-books"

  tags = {
    Name  = var.name
    Stage = var.stage
  }
}

resource "aws_iam_policy" "allow_reading_books_bucket" {
  name   = "${local.kebab-prefix}-${var.name}-books-bucket-read"
  policy = data.aws_iam_policy_document.allow_reading_books_bucket.json
}

data "aws_iam_policy_document" "allow_reading_books_bucket" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
    ]
    resources = ["${aws_s3_bucket.books.arn}/*", aws_s3_bucket.books.arn]
  }
}

resource "aws_iam_policy" "allow_writing_books_bucket" {
  name   = "${local.kebab-prefix}-${var.name}-books-bucket-write"
  policy = data.aws_iam_policy_document.allow_writing_books_bucket.json
}

data "aws_iam_policy_document" "allow_writing_books_bucket" {
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
    ]
    resources = ["${aws_s3_bucket.books.arn}/*", aws_s3_bucket.books.arn]
  }
}

resource "aws_dynamodb_table" "books" {
  name           = "${local.kebab-prefix}-books"
  hash_key       = "Author"
  range_key      = "Title"
  read_capacity  = 1
  write_capacity = 1

  attribute {
    name = "Author"
    type = "S"
  }

  attribute {
    name = "Title"
    type = "S"
  }

  tags = {
    Name  = var.name
    Stage = var.stage
  }
}

resource "aws_iam_policy" "allow_reading_books_table" {
  name   = "${local.kebab-prefix}-${var.name}-books-table-read"
  policy = data.aws_iam_policy_document.allow_reading_books_table.json
}

data "aws_iam_policy_document" "allow_reading_books_table" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
    ]
    resources = [aws_dynamodb_table.books.arn]
  }
}

resource "aws_iam_policy" "allow_writing_books_table" {
  name   = "${local.kebab-prefix}-${var.name}-books-table-write"
  policy = data.aws_iam_policy_document.allow_writing_books_table.json
}

data "aws_iam_policy_document" "allow_writing_books_table" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
    ]
    resources = [aws_dynamodb_table.books.arn]
  }
}
