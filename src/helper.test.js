import {Readable} from 'stream';
import Helper from './helper';

describe('helper', () => {
  describe('streamToBuffer', () => {
    it('should convert a stream into a buffer', async () => {
      const stream = Readable.from('test stream');
      const buffer = await (new Helper).toBuffer(stream);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.toString()).toBe('test stream');
    });
  });
});
