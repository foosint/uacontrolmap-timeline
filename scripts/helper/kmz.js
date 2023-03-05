import fs from 'node:fs';
import { once } from 'node:events';
import fetch from 'node-fetch';
import { centroid } from '@turf/turf';
import parseKMZ from 'parse2-kmz';
import decompress from 'decompress';
import { XMLParser } from  "fast-xml-parser";

export const downloadLatestKMZ = async (outputFile) => {
  const stream = fs.createWriteStream(outputFile);
  const url = "https://www.google.com/maps/d/u/0/kml?mid=180u1IkUjtjpdJWnIC0AxTKSiqK4G6Pez";
  const response = await fetch(url);
  response.body.pipe(stream);
  await once(stream, 'finish');
}

export const kmz2json = async (kmzFilePath) => {
  return await parseKMZ.toJson(kmzFilePath);
}

export const polygon2centroid = (polygonGeometry) => {
  return centroid(polygonGeometry);
}

export const kmz2kml = async (kmzFilePath, destFolder) => {
  await decompress(kmzFilePath, destFolder);
}

export const parseImportantAreas = async (kmlContent) => {
  const parser = new XMLParser();
  const obj = parser.parse(kmlContent);
  // get style maps TODO
  // get folders
  const importantAreas = [];
  const folders = obj.kml.Document.Folder;
  folders.forEach((folder) => {
    if (folder.name === 'Important Areas') {
      folder.Placemark.forEach((placemark) => {
        // filter more areas, only leave russian ones to show the frontline
        const wantedAreas = [
          'Luhansk Axis [Z]',
          'Donetsk Axis [Z]',
          'Crimean Axis [Z]',
          'Pre-War Crimea',
          'Crimea',
        ];
        const fixedPlacemarkName = placemark.name.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g," ");

        if (wantedAreas.includes(fixedPlacemarkName)) {
          importantAreas.push(fixedPlacemarkName);
        } else {
          // console.log('#',fixedPlacemarkName,'#');
        }
      })
    }
  })
  return importantAreas;
}
