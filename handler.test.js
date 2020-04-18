import {addAWSMocksToContainer} from './test/doubles/aws_mocks';
import {handleEPubUploadedToS3, handleUpdateSharedData} from './handler';
import {makeContainer} from './src/container';

describe('handling an epub file uploaded to an s3 bucket', () => {
  const S3ObjectCreatedEvent = {
    Records: [{
      s3: {
        bucket: {name: 'upload-bucket'},
        object: {key: 'test-file.epub'}
      }
    }]
  };

  describe('a new book that is not currently in the library', () => {
    it('adds the book to the library', async () => {
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

      expect(getMock('S3.upload')).toHaveBeenCalledWith({
        Body: expect.any(Buffer),
        Bucket: 'the-infinite-library-test-books',
        Key: expect.stringContaining('public/'),
      }, expect.anything());
    });
  });

  describe('a new book that is not a valid file', () => {
    it('throws an error', async () => {
      const container = makeContainer();
      const getMock = addAWSMocksToContainer(container, {
        'S3.getObject': jest.fn(async () => ({
          AcceptRanges: 'bytes',
          Body: Buffer.from('not a valid epub file'),
          ContentLength: 3191,
          ContentType: 'application/epub+zip',
          ETag: '6805f2cfc46c0f04559748bb039d69ae',
          Metadata: {},
          TagCount: 2,
          VersionId: 'null'
        })),
        'DynamoDB.getItem': jest.fn(async (params) => ({TableName: params.TableName})),
      });

      await expect(handleEPubUploadedToS3(S3ObjectCreatedEvent))
        .rejects.toStrictEqual([expect.any(Error)]);

      expect(getMock('S3.getObject')).toHaveBeenCalledWith({
        Bucket: 'upload-bucket',
        Key: 'test-file.epub'
      }, expect.anything());

      expect(getMock('DynamoDB.getItem')).not.toHaveBeenCalled();
      expect(getMock('DynamoDB.putItem')).not.toHaveBeenCalled();
      expect(getMock('S3.upload')).not.toHaveBeenCalled();
    });
  });
});

describe('handling a request to update the shared data file', () => {
  it('updates both authors and books data files', async () => {
    const container = makeContainer();
    const getMock = addAWSMocksToContainer(container);
    const response = await handleUpdateSharedData();

    expect(response).toHaveProperty('error', null);

    expect(getMock('DynamoDB.scan')).toHaveBeenCalledWith({
      TableName: 'the-infinite-library-test-books'
    }, expect.any(Function));

    expect(getMock('S3.putObject')).toHaveBeenNthCalledWith(1, {
      Bucket: 'the-infinite-library-test-data',
      Key: 'public/data/books.json',
      Body: Buffer.from(JSON.stringify({
        books: [{
          author: 'V. Anton Spraul',
          title: 'Think Like a Programmer',
          files: [{type: 'epub', location: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb', file: null}]
        }, {
          author: 'Norman Matloff',
          title: 'Art of R Programming',
          files: [{type: 'epub', location: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb', file: null}]
        }, {
          author: 'Orson Scott Card',
          title: 'Children of the Mind',
          files: [{type: 'epub', location: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb', file: null}]
        }, {
          author: 'Orson Scott Card',
          title: 'Seventh Son',
          files: [{type: 'epub', location: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb', file: null}]
        }], lastUpdated: Math.round(Date.now() / 1000)
      })),
    }, expect.any(Function));

    expect(getMock('S3.putObject')).toHaveBeenNthCalledWith(2, {
      Bucket: 'the-infinite-library-test-data',
      Key: 'public/data/authors.json',
      Body: Buffer.from(JSON.stringify({
        authors: [{
          author: 'V. Anton Spraul',
          books: [{
            title: 'Think Like a Programmer',
            files: [{type: 'epub', location: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb', file: null}]
          }]
        }, {
          author: 'Norman Matloff',
          books: [{
            title: 'Art of R Programming',
            files: [{type: 'epub', location: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb', file: null}]
          }]
        }, {
          author: 'Orson Scott Card',
          books: [{
            title: 'Children of the Mind',
            files: [{type: 'epub', location: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb', file: null}]
          }, {
            title: 'Seventh Son',
            files: [{type: 'epub', location: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb', file: null}]
          }]
        }], lastUpdated: Math.round(Date.now() / 1000)
      })),
    }, expect.any(Function));
  });
});
