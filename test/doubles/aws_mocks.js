import AWS from 'aws-sdk';
import AWSMock from 'aws-sdk-mock';
import {v4 as uuid} from 'uuid';
import {readFileSync} from 'fs';
import {resolve} from 'path';

export const addAWSMocksToContainer = (container, customMocks = {}) => {
  let mocks = {
    'DynamoDB.getItem': jest.fn(async (params) => {
      return {
        Item: {
          Author: {S: 'Edgar Allan Poe'},
          Title: {S: 'The Cask of Amontillado'},
          Files: {
            L: [{
              M: {
                Location: {S: uuid()},
                Type: {S: 'epub'},
              }
            }]
          },
        },
        TableName: params.TableName,
      };
    }),
    'DynamoDB.putItem': jest.fn(async (item) => {
      return ({
        ConsumedCapacity: {
          CapacityUnits: 1,
          TableName: item.TableName
        }
      });
    }),
    'DynamoDB.query': jest.fn(async () => ({
      Items: [{
        Author: {S: 'V. Anton Spraul'},
        Title: {S: 'Think Like a Programmer'},
        Files: {
          L: [{
            M: {
              Type: {S: 'epub'},
              Location: {S: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb'}
            }
          }]
        }
      }, {
        Author: {S: 'Norman Matloff'},
        Title: {S: 'Art of R Programming'},
        Files: {
          L: [{
            M: {
              Type: {S: 'epub'},
              Location: {S: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb'}
            }
          }]
        }
      }, {
        Author: {S: 'Orson Scott Card'},
        Title: {S: 'Children of the Mind'},
        Files: {
          L: [{
            M: {
              Type: {S: 'epub'},
              Location: {S: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb'}
            }
          }]
        }
      }, {
        Author: {S: 'Orson Scott Card'},
        Title: {S: 'Seventh Son'},
        Files: {
          L: [{
            M: {
              Type: {S: 'epub'},
              Location: {S: '1292d5d1-68e8-4938-9ec7-23aa3681f6eb'}
            }
          }]
        }
      }]
    })),
    'S3.getObject': jest.fn(async () => ({
      AcceptRanges: 'bytes',
      Body: readFileSync(resolve(__dirname, '../../test/files/the-cask-of-amontillado.epub')),
      ContentLength: 3191,
      ContentType: 'image/jpeg',
      ETag: '6805f2cfc46c0f04559748bb039d69ae',
      Metadata: {
      },
      TagCount: 2,
      VersionId: 'null'
    })),
    'S3.putObject': jest.fn(async () => {

    }),
    'S3.upload': jest.fn(async () => {

    }),
    'SSM.getParameter': jest.fn(async (params) => {
      if (params.Name === '/the-infinite-library/test/settings') {
        return {
          Parameter: {
            Name: params.Name,
            Type: 'String',
            Value: JSON.stringify({
              storage: {
                data: {
                  books: {
                    bucket: 'the-infinite-library-test-data',
                    key: 'public/data/books.json'
                  }
                },
                books: {
                  data: {
                    table: 'the-infinite-library-test-books',
                  },
                  files: {
                    bucket: 'the-infinite-library-test-books',
                    prefix: 'public/',
                  },
                },
              },
            })
          }
        };
      }
    })
  };

  let getMock = (path) => {
    return customMocks[path] ? customMocks[path] : mocks[path];
  };

  AWSMock.setSDKInstance(AWS);

  Object.keys(mocks).forEach(path => {
    let [service, method] = path.split('.');

    if (
      AWSMock.services[service] &&
            Object.keys(AWSMock.services[service].methodMocks).includes(method)
    ) {
      AWSMock.restore(service, method);
    }
    AWSMock.mock(service, method, customMocks[path] ? customMocks[path] : mocks[path]);
  });

  container.set('aws', AWS);

  return getMock;
};
