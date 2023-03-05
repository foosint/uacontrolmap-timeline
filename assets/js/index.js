import basemap from './helper/basemap'


(async () => {
  const map = basemap();

  // this is just used to show the currently-displayed earthquakes
  // in the little sidebar. meant as an example of a use for the 'change'
  // event
  function updateList(timeline) {
    var displayed = timeline.getLayers();
    var list = document.getElementById("displayed-list");
    list.innerHTML = "";
    displayed.forEach(function (quake) {
      var li = document.createElement("li");
      li.innerHTML = quake.feature.properties.side;
      list.appendChild(li);
    });
  }

  // eqfeed_callback is called once the earthquake geojsonp file below loads
  const dataJson = await fetch('/data/timelinedata.json');
  const data = await dataJson.json();
  // console.log(data);
  // console.log(data.features)

  var getInterval = function (pos) {
    // console.log(pos.properties.startTimestamp)
    return {
      start: pos.properties.startTimestamp,
      end: pos.properties.startTimestamp + (10 * 86400),
    };
  };
  var timelineControl = L.timelineSliderControl({
    formatOutput: function (date) {
      console.log(date)
      return new Date(date * 1000).toString();
    },
  });
  var timeline = L.timeline(data, {
    getInterval: getInterval,
    pointToLayer: function (data, latlng) {
      const color = data.properties.side === "ua"
        ? '#0000ff'
        : '#ff0000';
      return L.circleMarker(latlng, {
        radius: 10,
        color: color,
        fillColor: color,
      }).bindPopup(
        '<a href="#">click for more info</a>'
      );
    },
  });
  timelineControl.addTo(map);
  timelineControl.addTimelines(timeline);
  timeline.addTo(map);
  timeline.on("change", function (e) {
    updateList(e.target);
  });
  updateList(timeline);



})()







