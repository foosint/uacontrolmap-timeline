import basemap from '../helper/basemap'

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

  const dataJson = await fetch('./data/frontline.json');
  const data = await dataJson.json();

  function getColorFor(str) {
    return "rgb(255,0,0)";
  }

  const getInterval = function (pos) {
    console.log(pos.properties.start)
    return {
      start: pos.properties.startTimestamp,
      end: pos.properties.startTimestamp + (1 * 86400),
    };
  };

  timeline = L.timeline(data, {
    getInterval: getInterval,
    style: function (data) {
      // console.log(data)
      return {
        stroke: false,
        color: getColorFor(data.properties.name),
        fillOpacity: 0.5,
      };
    },
    waitToUpdateMap: true,
    onEachFeature: function (feature, layer) {
      layer.bindTooltip(feature.properties.name);
    },
  });

  timelineControl = L.timelineSliderControl({
    formatOutput: function (date) {
      return new Date(date * 1000).toString();
    },
    enableKeyboardControls: true,
  });
  timeline.addTo(map);
  timelineControl.addTo(map);
  timelineControl.addTimelines(timeline);  
  timeline.on("change", function (e) {
    updateList(e.target);
  });
  updateList(timeline);



})()