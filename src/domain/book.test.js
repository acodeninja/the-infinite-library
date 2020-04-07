import Book from "./book";

describe('domain book', () => {
    it('instantiates with a null author', function () {
        let book = new Book();

        expect(book.author).toBeNull();
    });

    it('instantiates with a null title', function () {
        let book = new Book();

        expect(book.title).toBeNull();
    });
});
