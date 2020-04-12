import {BaseError, BaseGateway, BaseResponse, BaseUseCase} from './base';
import {makeContainer} from './container';

describe('base error', () => {
  it('is throwable with a message', () => {
    const throwingFunction = () => {
      throw new BaseError('test message');
    };

    expect(throwingFunction).toThrowError('test message');
  });
});

describe('base gateway', () => {
  it('accepts a container', async () => {
    const container = makeContainer();

    container.set('test', 'test');

    const gateway = new BaseGateway(container);

    expect(gateway.container.get('test')).toBe('test');
  });
});

describe('base response', () => {
  it('has a null error attribute', () => {
    const response = new BaseResponse;

    expect(response.error).toBeNull();
  });
});

describe('base use case', () => {
  it('accepts a container', async () => {
    const container = makeContainer();
    container.set('test', 'test');

    const gateway = new BaseUseCase(container);

    expect(gateway.container.get('test')).toBe('test');
  });
});
