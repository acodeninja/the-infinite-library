import Book, {BookFile} from "./book";

describe('domain book', () => {
    it('instantiates with a null author', () => {
        let book = new Book();

        expect(book.author).toBeNull();
    });

    it('instantiates with a null title', () => {
        let book = new Book();

        expect(book.title).toBeNull();
    });

    describe('a book file', () => {
        it('instantiates with an empty file stream', () => {
            let file = new BookFile();

            expect(file.stream).toBeNull();
        });
    });
});
