import {PassThrough} from 'stream';

export class BookFile {
    /**
     * @type {Readable}
     */
    stream = null;

    async toBuffer() {
        const streamClone = this.stream.pipe(new PassThrough());
        const chunks = []

        for await (let chunk of streamClone) {
            chunks.push(chunk)
        }

        return Buffer.concat(chunks);
    }
}

export default class Book {
    author = null;
    title = null;
}
