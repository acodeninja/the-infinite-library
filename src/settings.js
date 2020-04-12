import get from 'lodash.get';
import has from 'lodash.has';
import set from 'lodash.set';
import merge from 'lodash.merge';

export default class Settings {
    settings = {};

    constructor(container) {
      this.container = container;
    }

    async load() {
      const AWS = this.container.get('aws');

      const paramStore = await (new AWS.SSM).getParameter({
        Name: `${process.env.APP_NAME}/${process.env.APP_STAGE}/settings`
      }).promise();

      const settings = JSON.parse(paramStore.Parameter.Value);

      this.setAll(settings);
    }

    setAll(settings) {
      this.settings = merge(this.settings, settings);
    }

    set(path, value) {
      set(this.settings, path, value);
    }

    async get(path, defaultValue = null) {
      if (!has(this.settings, path)) {
        await this.load();
      }

      return get(this.settings, path, defaultValue);
    }
}
