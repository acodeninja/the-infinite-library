import {parseEpub} from '@gxl/epub-parser';
import {BaseRequest, BaseResponse, BaseUseCase} from '../base';

export class InvalidFileStreamError extends Error {
}

export class NoFileBufferProvidedError extends Error {

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
      if (!request.file) {
        throw new NoFileBufferProvidedError;
      }

      const parseResult = await parseEpub(request.file);

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
