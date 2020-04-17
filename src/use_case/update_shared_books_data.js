import {BaseResponse, BaseUseCase} from '../base';
import BookGateway from '../gateway/book_gateway';

export class UpdateSharedBooksDataResponse extends BaseResponse {

}

export default class UpdateSharedBooksData extends BaseUseCase {
  async execute() {
    const AWS = this.container.get('aws');
    const bookGateway = new BookGateway(this.container);
    const response = new UpdateSharedBooksDataResponse;

    const {books} = await bookGateway.query();
    const lastUpdated = Math.round(Date.now() / 1000);

    await (new AWS.S3).putObject({
      Bucket: await this.container.get('settings').get('storage.data.books.bucket'),
      Key: await this.container.get('settings').get('storage.data.books.key'),
      Body: Buffer.from(JSON.stringify({books, lastUpdated})),
    }).promise();

    return response;
  }
}
