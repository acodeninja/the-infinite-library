import AWS from 'aws-sdk';
import {Container, makeContainer} from './container';
import Settings from './settings';
import Helper from './helper';

describe('container', function () {
  it('allows objects to be added to the container', function () {
    const container = new Container;
    container.set('test', 'test');

    expect(container.get('test')).toBe('test');
  });

  it('has an AWS object', function () {
    const container = new Container;

    expect(container.get('aws')).toStrictEqual(AWS);
  });

  it('has a Settings object', function () {
    const container = new Container;

    expect(container.get('settings')).toBeInstanceOf(Settings);
  });

  it('has a Helper object', function () {
    const container = new Container;

    expect(container.get('helper')).toBeInstanceOf(Helper);
  });
});

describe('makeContainer', () => {
  it('returns an instantiated container', async () => {
    const container = makeContainer();

    expect(container).toBeInstanceOf(Container);
  });
});
