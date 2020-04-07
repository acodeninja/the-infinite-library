
import {parseEpub} from "@gxl/epub-parser";
import Book from "../domain/book";

export class InvalidFileError extends Error {
}

export class ExtractMetadataFromEpubResponse {
    book = null;
    error = null;
}

export class ExtractMetadataFromEpubRequest {
    file = null;
}

export default class ExtractMetadataFromEpub {
    constructor(request) {
        this.request = request;
    }

    async execute() {
        const response = new ExtractMetadataFromEpubResponse();
        const fileBuffer = await this.request.file.toBuffer();

        try {
            const parseResult = await parseEpub(fileBuffer);

            const {info: {author, title}} = parseResult;

            const book = new Book();

            book.author = author;
            book.title = title;

            response.book = book;
        } catch (e) {
            response.error = new InvalidFileError();
        }

        return response;
    }
}
