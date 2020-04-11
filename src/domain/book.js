export class BookFile {
    /** @type {string} */
    type = null;
    /** @type {string} */
    location = null;
    /** @type {Readable} */
    stream = null;
}

export default class Book {
    /** @type {string} */
    author = null;
    /** @type {string} */
    title = null;
    /** @type {BookFile[]} */
    files = [];
}
