import path from 'path';
import {getFilesInDirectory, parserFile} from './src/utils/defaultParser';
import {Logger} from './src/utils/logger2';

const looger = new Logger('offline_clients');

(async () => {
    const pathToStatic = path.resolve(__dirname, '../storage/clients');
    const files = await getFilesInDirectory(pathToStatic);
    looger.log('Get files from storage')
    files.forEach(async (file) => {
        await parserFile(file);
    });
})();
