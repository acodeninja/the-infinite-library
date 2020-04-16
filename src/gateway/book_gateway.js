import {v4 as uuid} from 'uuid';
import Book, {BookFile} from '../domain/book';
import {BaseError, BaseGateway} from '../base';

export class BookNotFoundError extends BaseError {}

export const bookFromItem = (item) => {
  const {
    Author: {S: author},
    Title: {S: title},
    Files: {L: files}
  } = item;

  const book = new Book;

  book.author = author;
  book.title = title;

  book.files = files.map(file => {
    const bookFile = new BookFile;
    const {M: {Location: { S: location }, Type: {S: type}}} = file;

    bookFile.location = location;
    bookFile.type = type;

    return bookFile;
  });

  return book;
};

export const itemFromBook = (book) => ({
  'Author': {
    S: book.author,
  },
  'Title': {
    S: book.title,
  },
  'Files': {
    L: book.files.map(bookFile => ({
      M: {
        Type: {S: bookFile.type},
        Location: {S: bookFile.location ? bookFile.location : uuid()},
      },
    }))
  },
});

export default class BookGateway extends BaseGateway {
  async put(book) {
    const AWS = this.container.get('aws');

    try {
      for (let file of book.files) {
        if (!file.location) {
          file.location = uuid();
        }
        let {location, file: Body} = file;

        await (new AWS.S3).upload({
          Bucket: await this.container.get('settings').get('storage.books.files.bucket'),
          Key: `${await this.container.get('settings').get('storage.books.files.prefix')}${location}`,
          Body,
        }).promise();
      }

      let Item = itemFromBook(book);

      await (new AWS.DynamoDB).putItem({
        Item,
        TableName: await this.container.get('settings').get('storage.books.data.table'),
      }).promise();

      return true;
    } catch (e) {
      return e;
    }
  }

  async fetch(author, title) {
    const AWS = this.container.get('aws');

    const fetchedItem = await (new AWS.DynamoDB).getItem({
      Key: {
        'Author': {S: author},
        'Title': {S: title}
      },
      TableName: await this.container.get('settings').get('storage.books.data.table'),
    }).promise();

    if (!fetchedItem.Item) throw new BookNotFoundError;

    const book = bookFromItem(fetchedItem.Item);

    book.files = await Promise.all(book.files.map(async (file) => {
      file.file = await (new AWS.S3).getObject({
        Bucket: await this.container.get('settings').get('storage.books.files.bucket'),
        Key: `${await this.container.get('settings').get('storage.books.files.prefix')}${file.location}`
      }).promise();

      return file;
    }));

    return book;
  }

  async query() {
    const AWS = this.container.get('aws');
    let results = [];
    let hasRecordsLeft = true;

    const getAllBooks = async (params) => await (new AWS.DynamoDB).query({
      ...params,
      TableName: await this.container.get('settings').get('storage.books.data.table'),
    }).promise();

    let params = {};

    while (hasRecordsLeft) {
      if (results.length > 0 && !params.ExclusiveStartKey) {
        hasRecordsLeft = false;
        continue;
      }

      let tempResults = await getAllBooks(params);

      results = results.concat(tempResults.Items);

      if (tempResults.LastEvaluatedKey) {
        params.ExclusiveStartKey = tempResults.LastEvaluatedKey;
      } else {
        delete params.ExclusiveStartKey;
      }
    }

    return {
      books: results.map(item => bookFromItem(item)),
    };
  }
}
