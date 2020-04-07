
import {parseEpub} from "@gxl/epub-parser";
import Book from "../domain/book";

export class ExtractMetadataFromEpubResponse {
    book = null;
}

export class ExtractMetadataFromEpubRequest {
    file = null;
}

export default class ExtractMetadataFromEpub {
    constructor(request) {
        this.request = request;
    }

    async execute() {
        const fileBuffer = await this.request.file.toBuffer();

        const parseResult = await parseEpub(fileBuffer);

        const {info: {author, title}} = parseResult;

        const book = new Book();

        book.author = author;
        book.title = title;

        const response = new ExtractMetadataFromEpubResponse();

        response.book = book;

        return response;
    }
}
