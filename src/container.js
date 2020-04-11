import AWS from 'aws-sdk';
import Settings from './settings';
import Helper from './helper';

export class Container {
    objects = {
      'aws': AWS,
      'helper': new Helper,
      'settings': new Settings,
    };

    get(path) {
      return this.objects[path];
    }

    set(path, object) {
      this.objects[path] = object;

      return this;
    }
}

export const makeContainer = () => new Container;
export default new Container;
