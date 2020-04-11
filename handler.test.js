import {addAWSMocksToContainer} from './test/doubles/aws_mocks';
import {container, handleEPubUploadedToS3} from './handler';
import {Readable} from 'stream';

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
    container.get('settings').setAll({
      storage: {
        books: {
          data: {
            table: 'books-table',
          },
          files: {
            bucket: 'books-bucket',
            prefix: 'books-prefix/',
          },
        },
      },
    });

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
      TableName: 'books-table'
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
      TableName: 'books-table'
    }, expect.anything());

    expect(getMock('S3.putObject')).toHaveBeenCalledWith({
      Body: expect.any(Readable),
      Bucket: 'books-bucket',
      Key: expect.stringContaining('books-prefix/'),
    }, expect.anything());
  });
});
