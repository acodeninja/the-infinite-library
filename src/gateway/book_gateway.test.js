import {Readable} from 'stream';
import {makeContainer} from '../container';
import Book, {BookFile} from '../domain/book';
import BookGateway, {bookFromItem, itemFromBook} from './book_gateway';
import {addAWSMocksToContainer} from '../../test/doubles/aws_mocks';
import {createReadStream} from 'fs';
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
      expect(book.files.map(f => f.stream)[0]).toBeInstanceOf(Readable);
      expect(book.files.map(f => f.stream)[0].readable).toBeTruthy();
    });
  });
});

describe('putting a new book', () => {
  describe('with an author, title, and file', () => {
    it('puts the book to dynamo db', async () => {
      const container = makeContainer();
      const getMock = addAWSMocksToContainer(container);

      container.get('settings').set('storage.books.data.table', 'books-table');
      container.get('settings').set('storage.books.files.bucket', 'books-bucket');
      container.get('settings').set('storage.books.files.prefix', 'books-prefix/');

      const bookGateway = new BookGateway(container);

      const book = new Book;

      book.author = 'Edgar Allan Poe';
      book.title = 'The Cask of Amontillado';

      const bookFile = (new BookFile);

      bookFile.location = 'test-file-path';
      bookFile.type = 'epub';
      bookFile.stream = createReadStream(resolve(__dirname, '../../test/files/the-cask-of-amontillado.epub'));
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
        TableName: 'books-table',
      }, expect.anything());

      expect(getMock('S3.putObject')).toHaveBeenCalledWith({
        Body: expect.any(Readable),
        Bucket: 'books-bucket',
        Key: expect.stringContaining('books-prefix/'),
      }, expect.anything());
      expect(response).toBeTruthy();
    });
  });
});
