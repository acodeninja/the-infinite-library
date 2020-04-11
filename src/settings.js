import set from 'lodash.set';
import get from 'lodash.get';

export default class Settings {
    settings = {};

    constructor() {
      try {
        this.settings = JSON.parse(process.env.APP_SETTINGS);
      } catch (e) {
        this.settings = {};
      }
    }

    set(path, value) {
      set(this.settings, path, value);
    }

    get(path, defaultValue = null) {
      return get(this.settings, path, defaultValue);
    }
}
