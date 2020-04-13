import {readFileSync} from 'fs';
import {resolve} from 'path';
import ExtractMetadataFromEpub, {
  ExtractMetadataFromEpubRequest,
  InvalidFileStreamError,
  NoFileBufferProvidedError
} from './extract_metadata_from_epub';
import {makeContainer} from '../container';

const extractMetadata = async (file) => {
  const container = makeContainer();
  const request = new ExtractMetadataFromEpubRequest;

  request.file = file;

  return await (new ExtractMetadataFromEpub(container))
    .execute(request);
};

describe('extracting metadata from an epub file stream', () => {
  describe('extracting data from a valid epub file stream', () => {
    it('returns the expected metadata for the cask of amontillado', async () => {
      const file = readFileSync(resolve(__dirname, '../../test/files/the-cask-of-amontillado.epub'));
      const response = await extractMetadata(file);

      expect(response.author).toBe('Edgar Allan Poe');
      expect(response.title).toBe('The Cask of Amontillado');
    });

    it('returns the expected metadata for aesop\'s fables', async () => {
      const file = readFileSync(resolve(__dirname, '../../test/files/aesop.epub'));
      const response = await extractMetadata(file);

      expect(response.author).toBe('Aesop');
      expect(response.title).toBe('Aesop\'s Fables');
    });
  });

  describe('extracting data from an invalid epub file stream', () => {
    it('returns an error', async () => {
      const file = Buffer.from('not an epub file');
      const response = await extractMetadata(file);

      expect(response.error).toBeInstanceOf(InvalidFileStreamError);
    });
  });

  describe('extracting data without providing a file stream', () => {
    it('returns an error', async () => {
      const response = await extractMetadata(null);

      expect(response.error).toBeInstanceOf(NoFileBufferProvidedError);
    });
  });
});
