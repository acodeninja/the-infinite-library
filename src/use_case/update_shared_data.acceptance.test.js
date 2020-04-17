import {makeContainer} from '../container';
import {addAWSMocksToContainer} from '../../test/doubles/aws_mocks';
import UpdateSharedBooksData from './update_shared_data';


describe('updating the shared data file', () => {
  describe('updating the shared data file when the library has items in it', () => {
    it('adds the books to the data file', async () => {
      const container = makeContainer();
      const getMock = addAWSMocksToContainer(container);

      const updateSharedDataFile = new UpdateSharedBooksData(container);

      const response = await updateSharedDataFile.execute();

      expect(response).toHaveProperty('error', null);

      expect(getMock('DynamoDB.query')).toHaveBeenCalledWith({
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

  describe('updating the shared data file when the library is empty of books', () => {
    it('updates the books data with an empty array', async () => {
      const container = makeContainer();
      const getMock = addAWSMocksToContainer(container, {
        'DynamoDB.query': jest.fn(async (params) => ({
          Items: [],
          TableName: params.TableName,
        })),
      });

      const updateSharedDataFile = new UpdateSharedBooksData(container);

      const response = await updateSharedDataFile.execute();

      expect(response).toHaveProperty('error', null);

      expect(getMock('DynamoDB.query')).toHaveBeenCalledWith({
        TableName: 'the-infinite-library-test-books'
      }, expect.any(Function));

      expect(getMock('S3.putObject')).toHaveBeenNthCalledWith(1, {
        Bucket: 'the-infinite-library-test-data',
        Key: 'public/data/books.json',
        Body: Buffer.from(JSON.stringify({
          books: [],
          lastUpdated: Math.round(Date.now() / 1000),
        })),
      }, expect.any(Function));

      expect(getMock('S3.putObject')).toHaveBeenNthCalledWith(2, {
        Bucket: 'the-infinite-library-test-data',
        Key: 'public/data/authors.json',
        Body: Buffer.from(JSON.stringify({
          authors: [],
          lastUpdated: Math.round(Date.now() / 1000),
        })),
      }, expect.any(Function));
    });
  });
});
