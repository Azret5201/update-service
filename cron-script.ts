import path from 'path';
import { getFilesInDirectory, parserFile } from './utils/defaultParser';

(async () => {
  const pathToStatic = path.resolve(__dirname, 'storage/clients');
  const files = await getFilesInDirectory(pathToStatic);
  
  files.forEach(async (file) => {
    await parserFile(file);
  });
})();
