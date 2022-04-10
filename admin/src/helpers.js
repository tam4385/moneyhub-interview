// Generate array of csv strings
const generateCsvs = (companies, values, holdingValues) => {
  // Get a string of the datapoints - add empty string for new line to encode new line in CSV
  const csvs = companies.map((company, i) => [
    values.id,
    values.firstName,
    values.lastName,
    values.date,
    company.name,
    holdingValues[i], `
  `]
    .toString())
  return csvs
}

module.exports = generateCsvs
