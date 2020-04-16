import 'regenerator-runtime/runtime.js';
import {makeContainer} from './src/container';
import HandleEPubUploadedToS3, {HandleEPubUploadedToS3Request} from './src/use_case/handle_an_epub_uploaded_to_s3';

export const container = makeContainer();

export const handleEPubUploadedToS3 = async (event) => {
  const request = new HandleEPubUploadedToS3Request;

  request.records = event.Records;

  const response = await (new HandleEPubUploadedToS3(container)).execute(request);

  if (
    Array.isArray(response.error) &&
      !!response.error.filter(e => !!e).length
  ) {
    throw response.error;
  }

  return response;
};
