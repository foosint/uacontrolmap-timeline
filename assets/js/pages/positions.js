import basemap from '../helper/basemap'
import * as params from '@params';

(async () => {
  const map = basemap();

  // on change
  function updateList(timeline) {
    // const displayed = timeline.getLayers(); // data for each displayed layer
    const onChangeDate = document.getElementById("on-change-date");
    const currentDate = new Date(timeline.time * 1000);
    const year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    let day  = currentDate.getDate();
    if (day < 10) {
      day = '0' + day;
    }
    if (month < 10) {
      month = `0${month}`;
    }
    const displayDate = `${day}.${month}.${year}`;
    onChangeDate.innerHTML = `[ ${displayDate} ]`;
  }

  const dataJson = await fetch(`${params.baseURL}/data/positions.json`);
  const data = await dataJson.json();

  const getInterval = function (pos) {
    return {
      start: pos.properties.startTimestamp,
      end: pos.properties.startTimestamp + (10 * 86400),
    };
  };
  const timelineControl = L.timelineSliderControl({
    formatOutput: function (date) {
      return new Date(date * 1000).toString();
    },
  });
  const timeline = L.timeline(data, {
    getInterval: getInterval,
    pointToLayer: function (data, latlng) {
      const color = data.properties.side === "ua"
        ? '#0000ff'
        : '#ff0000';
      console.log(data);
      const title = `${data.properties.side.toUpperCase()} Position`;
      const description = data.properties.description;
      const msg = `<h4>${title}</h4><div class="msg">${description}</div>`;
      return L.circleMarker(latlng, {
        radius: 10,
        color: color,
        fillColor: color,
      }).bindPopup(msg);
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