import {BaseResponse, BaseUseCase} from '../base';
import BookGateway from '../gateway/book_gateway';

export class UpdateSharedBooksDataResponse extends BaseResponse {

}

export default class UpdateSharedBooksData extends BaseUseCase {
  async execute() {
    const AWS = this.container.get('aws');
    const bookGateway = new BookGateway(this.container);
    const response = new UpdateSharedBooksDataResponse;

    try {
      const {books} = await bookGateway.scan();
      const authors = this.booksToAuthors(books);
      const lastUpdated = Math.round(Date.now() / 1000);

      await (new AWS.S3).putObject({
        Bucket: await this.container.get('settings').get('storage.public.bucket'),
        Key: await this.container.get('settings').get('storage.public.books'),
        Body: Buffer.from(JSON.stringify({books, lastUpdated})),
      }).promise();

      await (new AWS.S3).putObject({
        Bucket: await this.container.get('settings').get('storage.public.bucket'),
        Key: await this.container.get('settings').get('storage.public.authors'),
        Body: Buffer.from(JSON.stringify({authors, lastUpdated})),
      }).promise();

    } catch (error) {
      response.error = error;

    }

    return response;
  }

  booksToAuthors(inputBooks) {
    let books = [...inputBooks];
    let authors = [];
    books.unshift({});
    const reducedAuthors = books.reduce((accumulator, book) => ({
      ...accumulator,
      [book.author]: {
        books: accumulator[book.author] ? [...accumulator[book.author].books, {
          title: book.title,
          files: book.files,
        }] : [{
          title: book.title,
          files: book.files,
        }]
      }
    }));

    for (let author of Object.keys(reducedAuthors)) {
      authors.push({
        author,
        ...reducedAuthors[author],
      });
    }

    return authors;
  }
}
