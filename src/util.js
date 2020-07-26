async function getCases() {
  const data = await getCountriesHistoricalData();

  return data
    .map((country) => toObject(country))
    .map((country) => convertCasesToKeyValuePairs(country));
}

function convertCasesToKeyValuePairs(country) {
  return {
    name: country.name,
    cases: Object.entries(country.cases).map(([date, value]) => ({
      date,
      value,
    })),
  };
}

function getGroupsByDate(countryName, cases) {
  return cases.reduce((groups, item) => {
    const date = item.date;

    if (!groups[date]) groups[date] = [];
    groups[date].push({ countryName, value: item.value });
    return groups;
  }, {});
}

function groupDataByDate(data) {
  return data.reduce((groupsByDate, { name: countryName, cases }) => {
    Object.entries(getGroupsByDate(countryName, cases)).forEach(
      ([key, value]) => {
        if (!groupsByDate[key]) groupsByDate[key] = [];
        groupsByDate[key].push(value[0]);
      }
    );

    return groupsByDate;
  }, {});
}