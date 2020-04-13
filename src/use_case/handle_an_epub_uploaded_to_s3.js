import ExtractMetadataFromEpub, {ExtractMetadataFromEpubRequest} from './extract_metadata_from_epub';
import {BaseRequest, BaseResponse, BaseUseCase} from '../base';
import BookGateway, {BookNotFoundError} from '../gateway/book_gateway';
import Book, {BookFile} from '../domain/book';

export class HandleEPubUploadedToS3Response extends BaseResponse {
    responses = [];
}

export class HandleEPubUploadedToS3RecordResponse extends BaseResponse {

}

export class HandleEPubUploadedToS3Request extends BaseRequest {
    records = [];
}

export default class HandleEPubUploadedToS3 extends BaseUseCase {
  async execute(request) {
    const AWS = this.container.get('aws');
    const response = new HandleEPubUploadedToS3Response;

    response.responses = await Promise.all(request.records.map(async (record) => {
      const recordResponse = new HandleEPubUploadedToS3RecordResponse;

      try {
        let {bucket: {name: Bucket}, object: {key: Key}} = record.s3;
        Key = Key.replace(/\+/g, ' ');

        const bookGateway = new BookGateway(this.container);
        const uploadedS3Object = await (new AWS.S3).getObject({
          Bucket,
          Key,
        }).promise();

        const extractMetadataRequest = new ExtractMetadataFromEpubRequest;
        extractMetadataRequest.file = uploadedS3Object.Body;

        const extractMetadataResponse = await (new ExtractMetadataFromEpub(this.container))
          .execute(extractMetadataRequest);

        const {author, title, error: extractMetadataError} = extractMetadataResponse;
        if (extractMetadataError) throw extractMetadataError;

        let book = new Book;

        book.author = author;
        book.title = title;

        try {
          book = await bookGateway.fetch(
            book.author,
            book.title,
          );
        } catch (error) {
          if (error.constructor !== BookNotFoundError) {
            throw error;
          }
        }

        const bookFile = new BookFile;

        bookFile.type = 'epub';
        bookFile.file = uploadedS3Object.Body;
        book.files.push(bookFile);

        recordResponse.putResponse = await bookGateway.put(book);
      } catch (error) {
        recordResponse.error = error;
      }

      return recordResponse;
    }));

    response.error = response.responses.map(r => r.error);

    return response;
  }
}
