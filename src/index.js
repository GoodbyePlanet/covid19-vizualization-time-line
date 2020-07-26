import "regenerator-runtime/runtime";
import axios from "axios";
import dateFormat from "dateformat";
import { balkanCountries } from "./constants";

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

async function getLastDate() {
  const data = await getCases();
  const cases = data[0].cases;
  const date = Object.keys(cases);

  return new Date(date[date.length - 1]);
}

async function getCases() {
  const data = await getCountriesHistoricalData();

  return data.map((country) => toObject(country));
}

function toObject(country) {
  return {
    countryName: country.data.country,
    cases: country.data.timeline.cases,
  };
}

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

function getTotalCases(cases) {
  return cases.reduce((acc, curr) => {
    const caseValues = Object.values(curr.cases);
    return (acc += caseValues[caseValues.length - 1]);
  }, 0);
}

// HIGH CHARTS

const startingDate = "2/25/20";
let startDate = new Date("2/25/20");

var initialData, chart;
let startYear = dateFormat(startDate, "m/d/yy"),
  endYear = 2018,
  btn = document.getElementById("play-pause-button"),
  input = document.getElementById("play-range");

var endDate;

(async function initializeEndDate() {
  endDate = await getLastDate();
})();

/**
 * Animate dataLabels functionality
 */
(function (H) {
  const FLOAT = /^-?\d+\.?\d*$/;

  // Add animated textSetter, just like fill/strokeSetters
  H.Fx.prototype.textSetter = function (proceed) {
    var startValue = this.start.replace(/ /g, ""),
      endValue = this.end.replace(/ /g, ""),
      currentValue = this.end.replace(/ /g, "");

    if ((startValue || "").match(FLOAT)) {
      startValue = parseInt(startValue, 10);
      endValue = parseInt(endValue, 10);

      // No support for float
      currentValue = Highcharts.numberFormat(
        Math.round(startValue + (endValue - startValue) * this.pos),
        0
      );
    }

    this.elem.endText = this.end;

    this.elem.attr(this.prop, currentValue, null, true);
  };

  // Add textGetter, not supported at all at this moment:
  H.SVGElement.prototype.textGetter = function (hash, elem) {
    var ct = this.text.element.textContent || "";
    return this.endText ? this.endText : ct.substring(0, ct.length / 2);
  };

  // Temporary change label.attr() with label.animate():
  // In core it's simple change attr(...) => animate(...) for text prop
  H.wrap(H.Series.prototype, "drawDataLabels", function (proceed) {
    var ret,
      attr = H.SVGElement.prototype.attr,
      chart = this.chart;

    if (chart.sequenceTimer) {
      this.points.forEach((point) =>
        (point.dataLabels || []).forEach(
          (label) =>
            (label.attr = function (hash, val) {
              if (hash && hash.text !== undefined) {
                var text = hash.text;

                delete hash.text;

                this.attr(hash);

                this.animate({
                  text: text,
                });
                return this;
              } else {
                return attr.apply(this, arguments);
              }
            })
        )
      );
    }

    ret = proceed.apply(this, Array.prototype.slice.call(arguments, 1));

    this.points.forEach((p) =>
      (p.dataLabels || []).forEach((d) => (d.attr = attr))
    );

    return ret;
  });
})(Highcharts);

function getData(year) {
  let output = initialData
    .map((data) => {
      return [data["countryName"], data.cases[year]];
    })
    .sort((a, b) => b[1] - a[1]);

  return [output[0], output];
}

Highcharts.getJSON(
  "https://api.npoint.io/d70fd8f47a70326609bb",
  async function (data) {
    initialData = await getCases();

    chart = Highcharts.chart("container", {
      chart: {
        animation: {
          duration: 500,
        },
        events: {
          render() {
            let chart = this;

            // Responsive input
            input.style.width =
              chart.plotWidth -
              chart.legend.legendWidth +
              chart.plotLeft / 2 -
              10 +
              "px"; // where 10 is a padding
          },
        },
        marginRight: 50,
      },
      plotOptions: {
        series: {
          animation: false,
          groupPadding: 0,
          pointPadding: 0.1,
          borderWidth: 0,
        },
      },
      title: {
        useHTML: true,
        text: `Total number of cases in Balkan countries: <b>${getTotalCases(
          initialData
        )}</b>`,
      },

      legend: {
        align: "right",
        verticalAlign: "bottom",
        itemStyle: {
          fontWeight: "bold",
          fontSize: "50px",
        },
        symbolHeight: 0.001,
        symbolWidth: 0.001,
        symbolRadius: 0.001,
      },
      xAxis: {
        type: "category",
      },
      yAxis: [
        {
          opposite: true,
          title: {
            text: "Cases per country",
          },
          tickAmount: 5,
        },
      ],
      series: [
        {
          colorByPoint: true,
          dataSorting: {
            enabled: true,
            matchByName: true,
          },
          type: "bar",
          dataLabels: [
            {
              enabled: true,
            },
          ],
          name: startYear,
          data: getData(startYear)[1],
        },
      ],
    });
  }
);

/**
 * Update the chart. This happens either on updating (moving) the range input,
 * or from a timer when the timeline is playing.
 */
async function update(increment) {
  if (increment) {
    input.value = dateFormat(
      new Date(startDate.setDate(startDate.getDate() + 1)),
      "m/d/yy"
    );
  }

  if (new Date(input.value) >= endDate) {
    input.value = startingDate;
    startDate = new Date("2/25/20");
    pause(btn);
  }

  chart.series[0].update({
    name: input.value,
    data: getData(input.value)[1],
  });
}

/**
 * Play the timeline.
 */
function play(button) {
  button.title = "pause";
  button.className = "fa fa-pause";
  chart.sequenceTimer = setInterval(async function () {
    await update(1);
  }, 500);
}

/**
 * Pause the timeline, either when the range is ended, or when clicking the pause button.
 * Pausing stops the timer and resets the button to play mode.
 */
function pause(button) {
  button.title = "play";
  button.className = "fa fa-play";
  clearTimeout(chart.sequenceTimer);
  chart.sequenceTimer = undefined;
}

btn.addEventListener("click", function () {
  if (chart.sequenceTimer) {
    pause(this);
  } else {
    play(this);
  }
});
/**
 * Trigger the update on the range bar click.
 */
input.addEventListener("click", function () {
  update();
});
