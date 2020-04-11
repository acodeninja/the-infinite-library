import Settings from './settings';

describe('settings', function () {
  it('allows values to be set', function () {
    const settings = new Settings;
    settings.set('test', 'test');

    expect(settings.get('test')).toBe('test');
  });

  it('instantiates with the APP_SETTINGS environment variable', function () {
    const initialSettings = {
      test: 'test'
    };
    process.env.APP_SETTINGS = JSON.stringify(initialSettings);

    const settings = new Settings;

    expect(settings.get('test')).toBe('test');
  });

  it('allows setting all values', function () {
    const settings = new Settings;
    settings.set('test', 'test');

    settings.setAll({
      foo: 'bar'
    });

    expect(settings.get('test')).toBeNull();
    expect(settings.get('foo')).toBe('bar');
  });
});
