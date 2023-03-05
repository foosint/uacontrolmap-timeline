const basemap = () => {

  const mapcenter = [48.96034143469434, 32.523124838234374];

  // tilelayer
  const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const cartoUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  // const stadiaUrl = "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";

  const osmAttrib =
    '&copy; <a href="https://openstreetmap.org/copyright">' +
    "OpenStreetMap</a> contributors";

  const osm = L.tileLayer(osmUrl, {
    maxZoom: 18,
    attribution: osmAttrib,
    noWrap: true,
  });   
  const carto = L.tileLayer(cartoUrl, {
    maxZoom: 18,
    // attribution: osmAttrib,
    noWrap: true,
  }); 
  // const stadia = L.tileLayer(stadiaUrl, {
  //   maxZoom: 18,
  //   attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  //   noWrap: true,
  // }); 


  const map = L.map("map", {
    layers: [osm],
    center: mapcenter,
    zoom: 6,
    maxBounds: [
      [90, -180],
      [-90, 180],
    ],
  });

  const baseMaps = {
    "OpenStreetMap": osm,
    // "Stadia": stadia,
    "CartoDB": carto
  };
  L.control.layers(baseMaps).addTo(map);

  return map;
}

export default basemap;