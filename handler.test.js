import {addAWSMocksToContainer} from './test/doubles/aws_mocks';
import {handleEPubUploadedToS3} from './handler';
import {Readable} from 'stream';
import {makeContainer} from './src/container';
process.env.APP_NAME = 'the-infinite-library';
process.env.APP_STAGE = 'test';

const S3ObjectCreatedEvent = {
  Records: [{
    s3: {
      bucket: {name: 'upload-bucket'},
      object: {key: 'test-file.epub'}
    }
  }]
};

describe('handling an epub file uploaded to an s3 bucket', () => {
  it('a new book that is not currently in the library', async () => {
    const container = makeContainer();
    const getMock = addAWSMocksToContainer(container, {
      'DynamoDB.getItem': jest.fn(async (params) => ({TableName: params.TableName})),
    });

    const response = await handleEPubUploadedToS3(S3ObjectCreatedEvent);

    expect(response.responses.map(r => r.error)).toStrictEqual([null]);

    expect(getMock('S3.getObject')).toHaveBeenCalledWith({
      Bucket: 'upload-bucket',
      Key: 'test-file.epub'
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

    expect(getMock('S3.putObject')).toHaveBeenCalledWith({
      Body: expect.any(Readable),
      Bucket: 'the-infinite-library-test-books',
      Key: expect.stringContaining('public/'),
    }, expect.anything());
  });
});
