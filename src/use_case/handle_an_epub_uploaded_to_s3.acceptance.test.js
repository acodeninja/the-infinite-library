import HandleEPubUploadedToS3, {HandleEPubUploadedToS3Request} from './handle_an_epub_uploaded_to_s3';
import {makeContainer} from '../container';
import {addAWSMocksToContainer} from '../../test/doubles/aws_mocks';
import {Readable} from 'stream';
process.env.APP_NAME = 'the-infinite-library';
process.env.APP_STAGE = 'test';

const S3ObjectCreatedEvent = {
  Records: [{
    s3: {
      bucket: {name: 'test-bucket'},
      object: {key: 'test-file'}
    }
  }]
};

const handleAnEPubUploadedToS3 = async (container, s3CreateObjectEvent) => {
  const request = new HandleEPubUploadedToS3Request;

  if (!s3CreateObjectEvent) {
    s3CreateObjectEvent = S3ObjectCreatedEvent;
  }
  request.records = s3CreateObjectEvent.Records;

  return await (new HandleEPubUploadedToS3(container)).execute(request);
};

describe('handling an epub file uploaded to an s3 bucket', () => {
  it('a new book that is not currently in the library', async () => {
    const container = makeContainer();
    const getMock = addAWSMocksToContainer(container, {
      'DynamoDB.getItem': jest.fn(async (params) => ({TableName: params.TableName})),
    });

    const response = await handleAnEPubUploadedToS3(container);

    expect(getMock('S3.getObject')).toHaveBeenCalledWith({
      Key: 'test-file',
      Bucket: 'test-bucket'
    }, expect.anything());

    expect(getMock('DynamoDB.getItem')).toHaveBeenCalledWith({
      Key: {
        Author: {S: 'Edgar Allan Poe'},
        Title: {S: 'The Cask of Amontillado'},
      },
      TableName: 'the-infinite-library-test-books'
    }, expect.anything());

    expect(getMock('DynamoDB.putItem')).toHaveBeenCalledWith({
      Item: {
        Author: {S: 'Edgar Allan Poe'},
        Title: {S: 'The Cask of Amontillado'},
        Files: {
          L: [{
            M: {
              Type: {S: 'epub'},
              Location: {S: expect.anything()}
            }
          }]
        }
      },
      TableName: 'the-infinite-library-test-books'
    }, expect.anything());

    expect(response.responses.map(r => r.error)).toStrictEqual([null]);
  });

  it('a book that is already present in the library', async () => {
    const container = makeContainer();
    const getMock = addAWSMocksToContainer(container);

    const response = await handleAnEPubUploadedToS3(container);

    expect(getMock('S3.getObject')).toHaveBeenCalledWith({
      Key: 'test-file',
      Bucket: 'test-bucket'
    }, expect.anything());

    expect(getMock('DynamoDB.getItem')).toHaveBeenCalledWith({
      Key: {
        Author: {S: 'Edgar Allan Poe'},
        Title: {S: 'The Cask of Amontillado'},
      },
      TableName: 'the-infinite-library-test-books'
    }, expect.anything());

    expect(getMock('DynamoDB.putItem')).toHaveBeenCalledWith({
      Item: {
        Author: {S: 'Edgar Allan Poe'},
        Title: {S: 'The Cask of Amontillado'},
        Files: {
          L: [{
            M: {
              Type: {S: 'epub'},
              Location: {S: expect.anything()}
            }
          }, {
            M: {
              Type: {S: 'epub'},
              Location: {S: expect.anything()}
            }
          }]
        }
      },
      TableName: 'the-infinite-library-test-books'
    }, expect.anything());

    expect(getMock('S3.putObject')).toHaveBeenCalledWith({
      Body: expect.any(Readable),
      Bucket: 'the-infinite-library-test-books',
      Key: expect.stringContaining('public/'),
    }, expect.anything());

    expect(response.responses.map(r => r.error)).toStrictEqual([null]);
  });
});



