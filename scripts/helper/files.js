import fs from 'node:fs';
import path from 'node:path';

export const getSortedDataFiles = (aPath) => {
  const dataFiles = [];
  fs.readdirSync(aPath, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .filter(dirent => path.extname(dirent.name) === '.kmz')
    .map((dirent) => {
      const dataFileName = dirent.name;
      const dataFileDate = path.parse(dirent.name).name.split('_')[0];
      dataFiles.push({
        name: dataFileName,
        date: dataFileDate
      })
    });
  return dataFiles;
}

export const deleteFolder = (aPath) => {
  fs.rmdirSync(aPath, { recursive: true });
}

export const getFileContent = (aPath) => {
  return fs.readFileSync(aPath);
}