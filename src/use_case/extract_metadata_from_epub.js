import {parseEpub} from '@gxl/epub-parser';
import {BaseRequest, BaseResponse, BaseUseCase} from '../base';

export class InvalidFileStreamError extends Error {
}

export class NoFileStreamProvidedError extends Error {

}

export class ExtractMetadataFromEpubResponse extends BaseResponse {
    author = null;
    title = null;
}

export class ExtractMetadataFromEpubRequest extends BaseRequest {
    file = null;
}

export default class ExtractMetadataFromEpub extends BaseUseCase {
  async execute(request) {
    const response = new ExtractMetadataFromEpubResponse;

    try {
      if (!request.file || !request.file.pipe) {
        throw new NoFileStreamProvidedError;
      }

      const fileBuffer = await this.container.get('helper').toBuffer(request.file);
      const parseResult = await parseEpub(fileBuffer);

      const {info: {author, title}} = parseResult;

      response.author = author;
      response.title = title;
    } catch (error) {
      response.error = error;

      if (error.message && error.message.indexOf('is this a zip file') !== -1) {
        response.error = (new InvalidFileStreamError);
      }
    }

    return response;
  }
}
