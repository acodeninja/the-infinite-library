import Book, {BookFile} from './book';

describe('a book', () => {
  it('instantiates with a null author', () => {
    let book = new Book;

    expect(book.author).toBeNull();
  });

  it('instantiates with a null title', () => {
    let book = new Book;

    expect(book.title).toBeNull();
  });

  it('instantiates with an empty set of files', () => {
    let book = new Book;

    expect(book.files).toStrictEqual([]);
  });

  describe('a book file', () => {
    it('instantiates with a null file buffer', () => {
      let bookFile = new BookFile;

      expect(bookFile.file).toBeNull();
    });

    it('instantiates with a null type', () => {
      let bookFile = new BookFile;

      expect(bookFile.type).toBeNull();
    });

    it('instantiates with a null location', () => {
      let bookFile = new BookFile;

      expect(bookFile.location).toBeNull();
    });
  });
});
