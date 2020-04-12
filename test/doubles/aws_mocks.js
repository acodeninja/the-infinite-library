import AWS from 'aws-sdk';
import AWSMock from 'aws-sdk-mock';
import {v4 as uuid} from 'uuid';
import {createReadStream} from 'fs';
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
    'S3.getObject': jest.fn(() =>
      createReadStream(resolve(__dirname, '../../test/files/the-cask-of-amontillado.epub'))
    ),
    'S3.putObject': jest.fn(async () => {

    }),
    'SSM.getParameter': jest.fn(async (params) => {
      if (params.Name === 'the-infinite-library/test/settings') {
        return {
          Parameter: {
            Name: params.Name,
            Type: 'String',
            Value: JSON.stringify({
              storage: {
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
