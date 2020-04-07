import {createReadStream} from 'fs';
import {resolve} from 'path'
import {Readable} from 'stream'
import ExtractMetadataFromEpub, {ExtractMetadataFromEpubRequest, InvalidFileError} from "./extract_metadata_from_epub";
import {BookFile} from "../domain/book";

const extractMetadata = async (fileStream) => {
    const request = new ExtractMetadataFromEpubRequest();

    const file = new BookFile();
    file.stream = fileStream;

    request.file = file;

    return await (new ExtractMetadataFromEpub(request)).execute();
}

describe('extracting metadata from an epub file', () => {
    describe('extracting data from a valid epub file', () => {
        it('returns the expected metadata', async () => {
            const file = createReadStream(resolve(__dirname, '../test/files/the-cask-of-amontillado.epub'));
            const response = await extractMetadata(file);

            expect(response.book.author).toBe('Edgar Allan Poe');
            expect(response.book.title).toBe('The Cask of Amontillado');
        });
    });

    describe('extracting data from an invalid epub file', () => {
        it('returns an error', async () => {
            const file = Readable.from('not an epub file');
            const response = await extractMetadata(file);

            expect(response.error).toBeInstanceOf(InvalidFileError);
        });
    });
});
