import {PassThrough} from 'stream';

export default class Helper {
  async toBuffer(input) {
    if (input instanceof Buffer) return input;

    const streamClone = input.pipe((new PassThrough));
    const chunks = [];

    for await (let chunk of streamClone) chunks.push(chunk);

    return Buffer.concat(chunks);
  }
}
