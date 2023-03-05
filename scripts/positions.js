import fs from 'node:fs';
import path from 'node:path';
import * as kmzHelper from './helper/kmz.js';


// constants
const DATA_TMP = './data';
const DATA_OUT = './src/static/data'; // for use in hugo


const generateTimelineData = async (jsonData) => {
  // extract properties.name for each feature
  // sort data into ru/ua postions by date
  const featureList = [];
  const { features } = jsonData;
  const pattern = /\[(\d+)\/(\d+)\/(\d+)\]\s*?(?:(Ru|Ua))\s*?Position/;
  features.forEach((feature) => {
    const { properties, geometry } = feature;
    const { name, description } = properties;
    const { type, coordinates } = geometry;
    // check for postion pattern in name property
    const match = name.match(pattern);
    if (match && match.length > 0) {
      const who = match[4].toLowerCase();
      const day = match[1];
      const month = match[2];
      const year = match[3];
      const eventDate = `20${year}-${month}-${day}`;
      const date = new Date(eventDate);
      const timeInMillisecond = date.getTime();
      const unixTimestamp = Math.floor(date.getTime() / 1000);
      // find centroid if type is Polygon
      if (type !== "Polygon") {
        return;
      }
      const aCentroid = kmzHelper.polygon2centroid(geometry);
      // update centroid data with start/end
      aCentroid.properties.start = eventDate;
      aCentroid.properties.startTimestamp = unixTimestamp;
      aCentroid.properties.end = eventDate;
      aCentroid.properties.endTimestamp = unixTimestamp + 86400000;
      aCentroid.properties.description = description;
      // at side
      aCentroid.properties.side = who;
      featureList.push(aCentroid);    
    }
  });

  const finalCollection = {
    "type": "FeatureCollection",
    "features": featureList
  }

  return finalCollection;

}



(async () => {
  // first get the latest kmz
  const latestKmzFile = path.join(DATA_TMP, 'positions.kmz');
  await kmzHelper.downloadLatestKMZ(latestKmzFile);
  // parse kmz into json
  const jsonData = await kmzHelper.kmz2json(latestKmzFile);
  // START DEBUG
  // const latestKmzJson = path.join(DATA_TMP, 'positions.json');
  // fs.writeFileSync(latestKmzJson, JSON.stringify(jsonData, 0, 4));
  // END DEBUG
  // generate data
  const finalCollection = await generateTimelineData(jsonData);
  // write  
  const positionsFile = path.join(DATA_OUT, 'positions.json');
  fs.writeFileSync(positionsFile, JSON.stringify(finalCollection));
})()
