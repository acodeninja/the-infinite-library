import {makeContainer} from '../container';
import Book, {BookFile} from '../domain/book';
import BookGateway, {bookFromItem, itemFromBook} from './book_gateway';
import {addAWSMocksToContainer} from '../../test/doubles/aws_mocks';
import {readFileSync} from 'fs';
import {resolve} from 'path';

process.env.APP_NAME = 'the-infinite-library';
process.env.APP_STAGE = 'test';

describe('creating a book gateway', () => {
  it('accepts the given container', async () => {
    const container = makeContainer();
    const testString = 'test string';
    const bookGateway = new BookGateway(container);

    container.set('test', testString);

    expect(bookGateway.container.get('test')).toBe(testString);
  });
});

describe('conversion of a book to and from storage', () => {
  const testItem = {
    Author: {S: 'Edgar Allan Poe'},
    Title: {S: 'The Cask of Amontillado'},
    Files: {L: []},
  };

  it('converts a dynamodb item to a book', () => {
    const book = bookFromItem(testItem);

    expect(book.author).toBe(testItem.Author.S);

    expect(book.title).toBe(testItem.Title.S);
  });

  it('converts a book to a dynamodb item', () => {
    const book = bookFromItem(testItem);
    const item = itemFromBook(book);

    expect(item.Author.S).toBe(testItem.Author.S);

    expect(item.Title.S).toBe(testItem.Title.S);
  });
});

describe('fetching a book', () => {
  describe('with an author, title', () => {
    it('returns the book requested with files', async () => {
      const container = makeContainer();
      const getMock = addAWSMocksToContainer(container);

      const bookGateway = new BookGateway(container);

      const book = await bookGateway.fetch(
        'Edgar Allan Poe',
        'The Cask of Amontillado',
      );

      expect(getMock('DynamoDB.getItem')).toHaveBeenCalledWith({
        Key: {
          Author: {S: 'Edgar Allan Poe'},
          Title: {S: 'The Cask of Amontillado'}
        },
        TableName: 'the-infinite-library-test-books',
      }, expect.anything());

      expect(getMock('S3.getObject')).toHaveBeenCalledWith({
        Key: expect.stringContaining('public/'),
        Bucket: 'the-infinite-library-test-books',
      }, expect.anything());

      expect(book).toBeInstanceOf(Book);

      expect(book.author).toBe('Edgar Allan Poe');

      expect(book.title).toBe('The Cask of Amontillado');

      expect(book.files.map(f => f.file)[0].Body).toBeInstanceOf(Buffer);
    });
  });
});

describe('putting a new book', () => {
  describe('with an author, title, and file', () => {
    it('puts the book to dynamo db', async () => {
      const container = makeContainer();
      const getMock = addAWSMocksToContainer(container);

      const bookGateway = new BookGateway(container);

      const book = new Book;

      book.author = 'Edgar Allan Poe';
      book.title = 'The Cask of Amontillado';

      const bookFile = (new BookFile);

      bookFile.location = 'test-file-path';
      bookFile.type = 'epub';
      bookFile.file = readFileSync(resolve(__dirname, '../../test/files/the-cask-of-amontillado.epub'));
      book.files = [bookFile];

      const response = await bookGateway.put(book);

      expect(getMock('DynamoDB.putItem')).toHaveBeenCalledWith({
        Item: {
          Author: {S: 'Edgar Allan Poe'},
          Title: {S: 'The Cask of Amontillado'},
          Files: {
            L: [{
              M: {
                Type: {S: 'epub'},
                Location: {S: 'test-file-path'}
              }
            }]
          }
        },
        TableName: 'the-infinite-library-test-books',
      }, expect.anything());

      expect(getMock('S3.upload')).toHaveBeenCalledWith({
        Body: expect.any(Buffer),
        Bucket: 'the-infinite-library-test-books',
        Key: expect.stringContaining('public/'),
      }, expect.anything());

      expect(response).toBeTruthy();
    });
  });
});

describe('querying books', () => {
  describe('getting all books in the library', () => {
    it('returns the books', async () => {
      const container = makeContainer();
      const getMock = addAWSMocksToContainer(container);

      const bookGateway = new BookGateway(container);

      const results = await bookGateway.scan();

      expect(getMock('DynamoDB.scan')).toHaveBeenCalledWith({
        TableName: 'the-infinite-library-test-books'
      }, expect.any(Function));

      expect(results).toHaveProperty('books', expect.any(Array));

      expect(results.books).toStrictEqual([
        expect.any(Book), expect.any(Book), expect.any(Book), expect.any(Book)
      ]);
    });
  });

  describe('getting all books in the library when the library is empty', () => {
    it('returns the right number of books', async () => {
      const container = makeContainer();
      const getMock = addAWSMocksToContainer(container, {
        'DynamoDB.scan': jest.fn(async (params) => ({
          Items: [],
          TableName: params.TableName,
        })),
      });

      const bookGateway = new BookGateway(container);

      const results = await bookGateway.scan();

      expect(getMock('DynamoDB.scan')).toHaveBeenCalledWith({
        TableName: 'the-infinite-library-test-books'
      }, expect.any(Function));

      expect(results).toHaveProperty('books', []);
    });
  });

  describe('getting all books in the library where there are more than 1mb in records', () => {
    it('returns the right number of books', async () => {
      const container = makeContainer();
      const getMock = addAWSMocksToContainer(container, {
        'DynamoDB.scan': jest.fn(async (filter) => {
          const results = {
            Items: [{
              Author: {S: 'V. Anton Spraul'},
              Title: {S: 'Think Like a Programmer'},
              Files: {
                L: [{
                  M: {
                    Type: {S: 'epub'},
                    Location: {S: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb'}
                  }
                }]
              }
            }, {
              Author: {S: 'Norman Matloff'},
              Title: {S: 'Art of R Programming'},
              Files: {
                L: [{
                  M: {
                    Type: {S: 'epub'},
                    Location: {S: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb'}
                  }
                }]
              }
            }]
          };

          if (!filter.ExclusiveStartKey) {
            results.LastEvaluatedKey = {};
            results.Items = [{
              Author: {S: 'Orson Scott Card'},
              Title: {S: 'Children of the Mind'},
              Files: {
                L: [{
                  M: {
                    Type: {S: 'epub'},
                    Location: {S: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb'}
                  }
                }]
              }
            }, {
              Author: {S: 'Orson Scott Card'},
              Title: {S: 'Seventh Son'},
              Files: {
                L: [{
                  M: {
                    Type: {S: 'epub'},
                    Location: {S: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb'}
                  }
                }]
              }
            }];
          }

          return results;
        }),
      });

      const bookGateway = new BookGateway(container);

      const results = await bookGateway.scan();

      expect(getMock('DynamoDB.scan')).toHaveBeenNthCalledWith(1,{
        TableName: 'the-infinite-library-test-books'
      }, expect.any(Function));

      expect(getMock('DynamoDB.scan')).toHaveBeenNthCalledWith(2, {
        ExclusiveStartKey: {},
        TableName: 'the-infinite-library-test-books'
      }, expect.any(Function));

      expect(results).toHaveProperty('books', expect.any(Array));

      expect(results.books.length).toBe(4);

      expect(results.books).toStrictEqual([
        expect.any(Book), expect.any(Book), expect.any(Book), expect.any(Book)
      ]);
    });
  });
});
