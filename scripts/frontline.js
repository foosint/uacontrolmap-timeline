
import fs from 'node:fs';
import path from 'node:path';
import * as kmzHelper from './helper/kmz.js';
import * as fileHelper from './helper/files.js';


// constants
const DATA_IN = './_data';
const DATA_OUT = './static/data'; // for use in hugo

const extractAllData = async (dailyPath, sortedFileList) => {
  // we need to unzip each kmz file to get the names of all
  // "Important Layers" folder - dirty hack, don't know a better way yet
  const featureList = [];
  const pattern = /(\d{2})(\d{2})(\d{2})/;
  for (const fileMeta of sortedFileList) {
    const filePath = path.join(dailyPath, fileMeta.name);
    const fileNameRaw = path.parse(fileMeta.name).name;
    const tmpFolder = path.join(DATA_IN, 'tmp', fileNameRaw);
    console.log(fileMeta.name)
    // get dateKey
    const dateKey = fileNameRaw.split('_')[0];
    const match = dateKey.toString().match(pattern);
    // console.log(dateKey. match)
    let unixTimestamp = 'foo'
    if (match && match.length > 0) {
      const day = match[3];
      const month = match[2];
      const year = match[1];
      const eventDate = `20${year}-${month}-${day}`;
      // console.log(fileNameRaw, eventDate)
      const date = new Date(eventDate);
      const timeInMillisecond = date.getTime();
      unixTimestamp = Math.floor(date.getTime() / 1000);
      // console.log(unixTimestamp)
    } else {
      console.log('no match')
      continue;
    }
    // unzip
    await kmzHelper.kmz2kml(filePath, tmpFolder);
    // read kml file and get all important areas
    const kmlFile = path.join(tmpFolder, 'doc.kml');
    const kmlContent = fileHelper.getFileContent(kmlFile);    
    const importantAreas = await kmzHelper.parseImportantAreas(kmlContent);
    // delete tmp again
    // fileHelper.deleteFolder(tmpFolder)
    // parse kmz into json
    const kmzFile = path.join(dailyPath, fileMeta.name);
    const jsonData = await kmzHelper.kmz2json(kmzFile);
    const { features } = jsonData;
    features.forEach((feature) => {
      const { properties } = feature;
      const { name } = properties;
      if (name === undefined) {
        return;
      }
      const fixedName = name.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g," ");
      if (importantAreas.includes(fixedName)) {
        feature.properties.start = dateKey;
        feature.properties.startTimestamp = unixTimestamp;
        feature.properties.end = dateKey;
        feature.properties.endTimestamp = unixTimestamp + 86400000;
        featureList.push(feature);
      }
    });
  };

  // final colection 
  const finalCollection = {
    "type": "FeatureCollection",
    "features": featureList
  }

  return finalCollection;


}




(async () => {

  // get a list of all sorted kmz files
  const dailyPath = path.join(DATA_IN, 'daily');
  const sortedFileList = fileHelper.getSortedDataFiles(dailyPath);
  // extract all data from each kmz file
  const finalCollection = await extractAllData(dailyPath, sortedFileList);
  // write  
  const outFile = path.join(DATA_OUT, 'frontline.json');
  fs.writeFileSync(outFile, JSON.stringify(finalCollection));

})()