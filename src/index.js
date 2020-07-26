import "regenerator-runtime/runtime";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_spiritedaway from "@amcharts/amcharts4/themes/spiritedaway";
import axios from "axios";

import { balkanCountries } from "./constants";

import dateFormat from "dateformat";

const {
  SERBIA,
  BOSNIA,
  GREECE,
  CROATIA,
  SLOVENIA,
  BULGARIA,
  MACEDONIA,
  ALBANIA,
  MONTENEGRO,
} = balkanCountries;

const BASE_COVID_API_URL = "https://disease.sh/v3/";
const HISTORICAL = "covid-19/historical/";
const REQUEST_PARAM = "?lastdays=-1"; // From API docs (use -1 to get all data)

///////

aaa();

// startSprint();

async function aaa() {
  const date = new Date("3/24/20");

  console.log(dateFormat(date, "m/dd/yy"));

  const dd = await getCases();

  console.log(dd);

  const gg = await getData();

  console.log("GG", gg);

  const lastDate = await getLastDate();
  console.log("LAST DATE ", dateFormat(date, "m/d/yy"));

  if (dateFormat(lastDate, "m/dd/yy") === "7/24/20") {
    console.log("THEY ARE THE SAME");
  }
}

// async function getLastDate() {
//   const data = await getCases();
//   const cases = data[0].cases;
//   const date = cases[cases.length - 1].date;

//   return new Date(date);
// }

// ///////

// async function startSprint() {
//   am4core.useTheme(am4themes_spiritedaway);

//   let chart = am4core.create("chartdiv", am4charts.XYChart);
//   chart.padding(40, 40, 40, 40);

//   chart.numberFormatter.bigNumberPrefixes = [
//     { number: 1e3, suffix: "K" },
//     // { number: 1e6, suffix: "M" },
//     // { number: 1e9, suffix: "B" },
//   ];

//   let label = chart.plotContainer.createChild(am4core.Label);
//   label.x = am4core.percent(97);
//   label.y = am4core.percent(95);
//   label.horizontalCenter = "right";
//   label.verticalCenter = "middle";
//   label.dx = -15;
//   label.fontSize = 50;

//   let playButton = chart.plotContainer.createChild(am4core.PlayButton);
//   playButton.x = am4core.percent(97);
//   playButton.y = am4core.percent(95);
//   playButton.dy = -2;
//   playButton.verticalCenter = "middle";
//   playButton.events.on("toggled", function (event) {
//     if (event.target.isActive) {
//       play();
//     } else {
//       stop();
//     }
//   });

//   let stepDuration = 1000;

//   let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
//   categoryAxis.renderer.grid.template.location = 0;
//   categoryAxis.dataFields.category = "countryName";
//   categoryAxis.renderer.minGridDistance = 1;
//   categoryAxis.renderer.inversed = true;
//   categoryAxis.renderer.grid.template.disabled = true;

//   let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
//   valueAxis.min = 0;
//   valueAxis.rangeChangeEasing = am4core.ease.linear;
//   valueAxis.rangeChangeDuration = stepDuration;
//   valueAxis.extraMax = 0.1;

//   let series = chart.series.push(new am4charts.ColumnSeries());
//   series.dataFields.categoryY = "countryName";
//   series.dataFields.valueX = "value";
//   series.tooltipText = "{valueX.value}";
//   series.columns.template.strokeOpacity = 0;
//   series.columns.template.column.cornerRadiusBottomRight = 5;
//   series.columns.template.column.cornerRadiusTopRight = 5;
//   series.interpolationDuration = stepDuration;
//   series.interpolationEasing = am4core.ease.linear;

//   let labelBullet = series.bullets.push(new am4charts.LabelBullet());
//   labelBullet.label.horizontalCenter = "right";
//   labelBullet.label.text = "{values.valueX.workingValue.formatNumber('#.0as')}";
//   labelBullet.label.textAlign = "end";
//   labelBullet.label.dx = -10;

//   chart.zoomOutButton.disabled = true;

//   // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
//   series.columns.template.adapter.add("fill", function (fill, target) {
//     return chart.colors.getIndex(target.dataItem.index);
//   });

//   let startDate = new Date("2/25/20");

//   let year = 2003;
//   label.text = dateFormat(startDate, "m/d/yy");

//   let interval;

//   async function play() {
//     interval = setInterval(async function () {
//       await nextYear();
//     }, stepDuration);
//     await nextYear();
//   }

//   function stop() {
//     if (interval) {
//       clearInterval(interval);
//     }
//   }

//   async function nextYear() {
//     year++;
//     startDate = new Date(startDate.setDate(startDate.getDate() + 1));

//     const lastDate = await getLastDate();
//     if (startDate > lastDate) {
//       startDate = new Date("2/25/20");
//     }

//     let newData = allData[dateFormat(startDate, "m/d/yy")];

//     // console.log('NEW DATA ', newData);

//     console.log('CHART DATA LENGHT ', chart.data.length);
//     console.log('CHART DATA ', chart.data);

//     let itemsWithNonZero = 0;
//     for (var i = 0; i < chart.data.length; i++) {
//       chart.data = newData;
//       console.log('chart.data[i].value', chart.data[i])
//       // console.log('chart.data ', chart.data);
//       // chart.data = newData

//       if (chart.data[i].value > 0) {
//         itemsWithNonZero++;
//       }
//     }

//     if (dateFormat(startDate, "m/d/yy") === "1/23/2020") {
//       series.interpolationDuration = stepDuration / 4;
//       valueAxis.rangeChangeDuration = stepDuration / 4;
//     } else {
//       series.interpolationDuration = stepDuration;
//       valueAxis.rangeChangeDuration = stepDuration;
//     }

//     chart.invalidateRawData();
//     label.text = dateFormat(startDate, "m/d/yy");

//     categoryAxis.zoom({
//       start: 0,
//       end: itemsWithNonZero / categoryAxis.dataItems.length,
//     });
//   }

//   categoryAxis.sortBySeries = series;

//   let allData = await getData();

//   console.log('allData', allData);

  

//   chart.data = JSON.parse(
//     JSON.stringify(allData[dateFormat(startDate, "m/d/yy")])
//   );
//   categoryAxis.zoom({ start: 0, end: 1 / chart.data.length });

//   series.events.on("inited", function () {
//     setTimeout(function () {
//       playButton.isActive = true; // this starts interval
//     }, 2000);
//   });
// }

// async function getData() {
//   const aaa = await getCases();

//   const bbb = groupDataByDate(aaa);

//   // console.log("BBB ", bbb);

//   return bbb;
// }

// function groupDataByDate(data) {
//   return data.reduce((groupsByDate, { name: countryName, cases }) => {
//     Object.entries(getGroupsByDate(countryName, cases)).forEach(
//       ([key, value]) => {
//         if (!groupsByDate[key]) groupsByDate[key] = [];
//         groupsByDate[key].push(value[0]);
//       }
//     );

//     return groupsByDate;
//   }, {});
// }

// function getGroupsByDate(countryName, cases) {
//   return cases.reduce((groups, item) => {
//     const date = item.date;

//     if (!groups[date]) groups[date] = [];
//     groups[date].push({ countryName, value: item.value });
//     return groups;
//   }, {});
// }

async function getCases() {
  const data = await getCountriesHistoricalData();

  return data
    .map((country) => toObject(country))
    // .map((country) => convertCasesToKeyValuePairs(country));
}

// async function getCases() {
//   const data = await getCountriesHistoricalData();

//   return data
//     .map((country) => toObject(country))
//     // .map((country) => convertCasesToKeyValuePairs(country));
// }

function convertCasesToKeyValuePairs(country) {
  return {
    name: country.name,
    cases: Object.entries(country.cases).map(([date, value]) => ({
      date,
      value,
    })),
  };
}

function toObject(country) {
  return { CountryName: country.data.country, cases: country.data.timeline.cases };
}

// function toObject(country) {
//   return { name: country.data.country, cases: country.data.timeline.cases };
// }

function getCountriesHistoricalData() {
  const serbia = getAllCasesForContry(SERBIA);
  const greece = getAllCasesForContry(GREECE);
  const croatia = getAllCasesForContry(CROATIA);
  const slovenia = getAllCasesForContry(SLOVENIA);
  const bosnia = getAllCasesForContry(BOSNIA);
  const bulgaria = getAllCasesForContry(BULGARIA);
  const macedonia = getAllCasesForContry(MACEDONIA);
  const albania = getAllCasesForContry(ALBANIA);
  const montenegro = getAllCasesForContry(MONTENEGRO);

  return Promise.all([
    serbia,
    greece,
    croatia,
    slovenia,
    bosnia,
    bulgaria,
    macedonia,
    albania,
    montenegro,
  ]);
}

async function getAllCasesForContry(country) {
  const URL = `${BASE_COVID_API_URL}${HISTORICAL}${country}${REQUEST_PARAM}`;

  try {
    return axios.get(URL);
  } catch (error) {
    console.error("An error has occured ", error);
  }
}


// HIGH CHARTS


let startDate = new Date("2/25/20");

//   let year = 2003;
//   label.text = dateFormat(startDate, "m/d/yy");

var initialData,
  chart;
const startYear = dateFormat(startDate, "m/d/yy"),
  endYear = 2018,
  btn = document.getElementById('play-pause-button'),
  input = document.getElementById('play-range');

/**
 * Animate dataLabels functionality
 */
(function(H) {
  const FLOAT = /^-?\d+\.?\d*$/;

  // Add animated textSetter, just like fill/strokeSetters
  H.Fx.prototype.textSetter = function(proceed) {
    var startValue = this.start.replace(/ /g, ''),
      endValue = this.end.replace(/ /g, ''),
      currentValue = this.end.replace(/ /g, '');

    if ((startValue || '').match(FLOAT)) {
      startValue = parseInt(startValue, 10);
      endValue = parseInt(endValue, 10);

      // No support for float
      currentValue = Highcharts.numberFormat(
        Math.round(startValue + (endValue - startValue) * this.pos), 0);
    }

    this.elem.endText = this.end;

    this.elem.attr(
      this.prop,
      currentValue,
      null,
      true
    );
  };

  // Add textGetter, not supported at all at this moment:
  H.SVGElement.prototype.textGetter = function(hash, elem) {
    var ct = this.text.element.textContent || '';
    return this.endText ? this.endText : ct.substring(0, ct.length / 2);
  }

  // Temporary change label.attr() with label.animate():
  // In core it's simple change attr(...) => animate(...) for text prop
  H.wrap(H.Series.prototype, 'drawDataLabels', function(proceed) {
    var ret,
      attr = H.SVGElement.prototype.attr,
      chart = this.chart;

    if (chart.sequenceTimer) {
      this.points.forEach(
        point => (point.dataLabels || []).forEach(
          label => label.attr = function(hash, val) {
            if (hash && hash.text !== undefined) {
              var text = hash.text;

              delete hash.text;

              this.attr(hash);

              this.animate({
                text: text
              });
              return this;
            } else {
              return attr.apply(this, arguments);
            }
          }
        )
      );
    }


    ret = proceed.apply(this, Array.prototype.slice.call(arguments, 1));

    this.points.forEach(
      p => (p.dataLabels || []).forEach(d => d.attr = attr)
    );

    return ret;

  });
})(Highcharts);

/**
 * Calculate the data output
 */

function getData(year) {

  console.log('YEAR IN GET DATA ', year);
  // console.log('INITIAL DATA ', initialData);

  let output = initialData.map(data => {
    return [data["CountryName"], data.cases[year]]
  }).sort((a, b) => b[1] - a[1]);

  console.log('OUTPUT ', output)
  console.log('OUTPUT[0] ', output[0])
  console.log('OUTPUT output.slice(1, 11) ', output.slice(1, 11))

  // return ([output[0], output.slice(1, 11)]);
  return ([output[0], output]);
}

Highcharts.getJSON('https://api.npoint.io/d70fd8f47a70326609bb', async function (data) {
		// console.log(data)
    // initialData = data;
    initialData = await getCases();

    console.log('INITIAL DATA ', initialData)
		
		  chart = Highcharts.chart('container', {
      chart: {
        animation: {
          duration: 500
        },
        events: {
          render() {
            let chart = this;

            // Responsive input
            input.style.width = chart.plotWidth - chart.legend.legendWidth + chart.plotLeft / 2 - 10 + 'px'// where 10 is a padding
          }
        },
        marginRight: 50,
      },
      plotOptions: {
        series: {
          animation: false,
          groupPadding: 0,
          pointPadding: 0.1,
          borderWidth: 0
        }
      },
      title: {
        useHTML: true,
        text: `World population - overall: <b>${getData(startYear)[0][1]}</b>`
      },

      legend: {
        align: 'right',
        verticalAlign: 'bottom',
        itemStyle: {
          fontWeight: 'bold',
          fontSize: '50px',
        },
        symbolHeight: 0.001,
        symbolWidth: 0.001,
        symbolRadius: 0.001,
      },
      xAxis: {
        type: 'category',
      },
      yAxis: [{
        opposite: true,
        title: {
          text: 'Population per country'
        },
        tickAmount: 5
      }],
      series: [{
        colorByPoint: true,
        dataSorting: {
          enabled: true,
          matchByName: true
        },
        type: 'bar',
        dataLabels: [{
          enabled: true,
        }],
        name: startYear,
        data: getData(startYear)[1]
      }]
    });
});

/**
 * Update the chart. This happens either on updating (moving) the range input,
 * or from a timer when the timeline is playing.
 */
function update(increment) {

  // console.log('INPUT.VALUE ', input.value)

  if (increment) {
    // input.value = parseInt(input.value) + increment;
    input.value = dateFormat(new Date(startDate.setDate(startDate.getDate() + 1)), 'm/d/yy');
  }
  if (input.value >= endYear) { // Auto-pause
    pause(btn);
  }

  chart.update({
    title: {
      useHTML: true,
      text: `<div>World population - overall: <b>${getData(input.value)[0][1]}</b></span></div>`
    },
  }, false, false, false)

  console.log('GET DATA ', getData(input.value));

  chart.series[0].update({
    name: input.value,
    data: getData(input.value)[1]
  })
}

/**
 * Play the timeline.
 */
function play(button) {
  button.title = 'pause';
  button.className = 'fa fa-pause';
  chart.sequenceTimer = setInterval(function() {
    update(1);
  }, 500);

}

/** 
 * Pause the timeline, either when the range is ended, or when clicking the pause button.
 * Pausing stops the timer and resets the button to play mode.
 */
function pause(button) {
  button.title = 'play';
  button.className = 'fa fa-play';
  clearTimeout(chart.sequenceTimer);
  chart.sequenceTimer = undefined;
}


btn.addEventListener('click', function() {
  if (chart.sequenceTimer) {
    pause(this)
  } else {
    play(this)
  }
})
/** 
 * Trigger the update on the range bar click.
 */
input.addEventListener('click', function() {
  update()
})


