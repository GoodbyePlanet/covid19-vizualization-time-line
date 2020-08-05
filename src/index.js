import "regenerator-runtime/runtime";
import axios from "axios";
import dateFormat from "dateformat";
import { balkanCountries, colors } from "./constants";
import { tsParticles } from "tsparticles";

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
const DATE_FORMAT = "m/d/yy";
const START_DATE = "2/24/20";

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
  return cases
    .reduce((acc, curr) => {
      const caseValues = Object.values(curr.cases);
      return (acc += caseValues[caseValues.length - 1]);
    }, 0)
    .toLocaleString();
}

// HIGH CHART

let startDate = new Date(START_DATE);
let startDateStringFormat = dateFormat(startDate, DATE_FORMAT);

var initialData, chart;
let playPauseButton = document.getElementById("play-pause-button");
let input = document.getElementById("play-range");
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

  H.SVGElement.prototype.textGetter = function (hash, elem) {
    var ct = this.text.element.textContent || "";
    return this.endText ? this.endText : ct.substring(0, ct.length / 2);
  };

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

function getData(date) {
  let output = initialData
    .map((data) => {
      return [data["countryName"], data.cases[date]];
    })
    .sort((a, b) => b[1] - a[1]);

  return [output[0], output];
}

Highcharts.getJSON(
  "https://api.npoint.io/d70fd8f47a70326609bb",
  async function () {
    initialData = await getCases();

    chart = Highcharts.chart("container", {
      chart: {
        backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
          stops: [
            [0, colors.WHITE],
            [1, colors.LIGHT_ORANGE],
          ],
        },
        style: {
          fontFamily: "Courier New",
        },
        animation: {
          duration: 500,
        },
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
        align: "center",
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
          name: startDateStringFormat,
          data: getData(startDateStringFormat)[1],
        },
      ],
    });
    // Start playing automatically once the chart is initialized
    play(playPauseButton);
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
      DATE_FORMAT
    );
  }

  if (new Date(input.value) >= endDate) {
    pause(playPauseButton);
    input.value = START_DATE;
    startDate = new Date(START_DATE);
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

playPauseButton.addEventListener("click", function () {
  if (chart.sequenceTimer) {
    pause(this);
  } else {
    play(this);
  }
});

const modal = document.getElementById("modal-id");

document.getElementById("open-modal-button").onclick = function () {
  modal.style.display = "block";
};

document.getElementsByClassName("close")[0].onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

tsParticles.load("tsparticles", {
  fpsLimit: 60,
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 1000
      }
    },
    color: {
      value: ["#DC143C", "#A52A2A", "#8FBC8F", "#B22222"],
    },
    shape: {
      type: ["circle"],
      stroke: {
        width: 0,
        color: "#fff"
      },
      polygon: {
        nb_sides: 5
      },
    },
    opacity: {
      value: 1,
      random: false,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false
      }
    },
    size: {
      value: 4,
      random: true,
      anim: {
        enable: false,
        speed: 10,
        size_min: 10,
        sync: false
      }
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ff9999",
      opacity: 0.4,
      width: 1
    },
    move: {
      enable: true,
      speed: 3,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200
      }
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "grab"
      },
      onclick: {
        enable: true,
        mode: "push"
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 140,
        line_linked: {
          opacity: 1
        }
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 8,
        speed: 3
      },
      repulse: {
        distance: 200,
        duration: 0.4
      },
      push: {
        particles_nb: 4
      },
      remove: {
        particles_nb: 2
      }
    }
  },
  retina_detect: true
});

