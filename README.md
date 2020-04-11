# The Infinite Library

The infinite library, a server-less ebook library deployed to an Aws_mock cloud.

## Use Cases

Initially, the application will consist of a small set of use cases. The
first use case will process an ebook and output some normalised metadata
about the book.

## Domains

The use cases will be supported by a few domain classes.

### Book

A book has an author and title, it represents a unique combination of
author and title, and may represent several ebook files.
