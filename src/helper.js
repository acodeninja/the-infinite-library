import {PassThrough} from 'stream';

export default class Helper {
  /**
   * @param input
   * @returns {Promise<Buffer>}
   */
  toBuffer(input) {
    return new Promise((resolve, reject) => {
      if (input instanceof Buffer) {
        resolve(input);
      }

      try {
        const streamClone = input.pipe(new PassThrough);
        const chunks = [];
        streamClone.on('data', chunk => {
          chunks.push(chunk);
        });
        streamClone.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        streamClone.on('error', (error) => {
          reject(error);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

}
