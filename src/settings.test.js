import Settings from './settings';
import {makeContainer} from './container';
import {addAWSMocksToContainer} from '../test/doubles/aws_mocks';
process.env.APP_NAME = 'the-infinite-library';
process.env.APP_STAGE = 'test';

describe('settings', function () {
  it('allows values to be set', async () => {
    const container = makeContainer();
    const settings = new Settings(container);
    settings.set('test', 'test');

    expect(await settings.get('test')).toBe('test');
  });

  it('instantiates with the settings parameter store content', async () => {
    const container = makeContainer();
    const getMock = addAWSMocksToContainer(container, {
      'SSM.getParameter': jest.fn(async (params) => ({
        Parameter: {
          Name: params.Name,
          Type: 'String',
          Value: JSON.stringify({
            test: 'test'
          })
        }
      })),
    });

    const settings = new Settings(container);

    expect(await settings.get('test')).toBe('test');
    expect(getMock('SSM.getParameter')).toHaveBeenCalledWith({
      Name: '/the-infinite-library/test/settings'
    }, expect.any(Function));
  });

  it('allows setting all values', async () => {
    const container = makeContainer();
    const settings = new Settings(container);
    addAWSMocksToContainer(container, {
      'SSM.getParameter': jest.fn(async (params) => ({
        Parameter: {
          Name: params.Name,
          Type: 'String',
          Value: JSON.stringify({}),
        }
      })),
    });

    settings.set('test', 'test');

    settings.setAll({
      foo: 'bar'
    });

    expect(await settings.get('test')).toBe('test');
    expect(await settings.get('foo')).toBe('bar');
  });
});
