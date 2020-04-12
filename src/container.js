import AWS from 'aws-sdk';
import Settings from './settings';
import Helper from './helper';

export class Container {
    objects = {};

    constructor() {
      this.set('aws', AWS);
      this.set('helper', new Helper);
      this.set('settings', new Settings(this));
    }

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
