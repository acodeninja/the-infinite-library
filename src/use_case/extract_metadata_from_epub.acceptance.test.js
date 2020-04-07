import {createReadStream} from 'fs';
import {resolve} from 'path'
import ExtractMetadataFromEpub, {ExtractMetadataFromEpubRequest} from "./extract_metadata_from_epub";
import {BookFile} from "../domain/book";

describe('extracting metadata from an epub file', () => {
    describe('extracting data from a valid epub file', () => {
        it('returns metadata when given a file stream containing an epub file', async () => {
            const request = new ExtractMetadataFromEpubRequest();

            const file = new BookFile();
            file.stream = createReadStream(resolve(__dirname, '../test/files/the-cask-of-amontillado.epub'));

            request.file = file;

            const metadataExtractor = new ExtractMetadataFromEpub(request);

            const response = await metadataExtractor.execute();

            expect(response.book.author).toBe('Edgar Allan Poe');
            expect(response.book.title).toBe('The Cask of Amontillado');
        });
    });
});
