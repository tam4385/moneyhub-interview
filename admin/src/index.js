const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const axios = require("axios")
const generateCsvs = require("./helpers")

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", (req, res) => {
  const {id} = req.params
  request.get(`${config.investmentsServiceUrl}/investments/${id}`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      res.send(investments)
    }
  })
})

// POST: generates csv report, send to investments /export
app.post("/reports/user-holdings/:id", async (req, res) => {
  console.log("Beginning create csv Report")

  try {
    // Fetch users investments data
    const response = await axios.get(`${config.investmentsServiceUrl}/investments/${req.params.id}`)

    const {holdings, investmentTotal} = response.data[0]

    // Function to get company names to append to csv data
    const getCompanyNames = async (holdings) => {
      const companyNames = []

      for (let i = 0; i < holdings.length; i++) {
        const response = await axios.get(`${config.financialCompaniesUrl}/companies/${holdings[i].id}`)
        companyNames.push(response.data)
      }
      return companyNames
    }

    // Get the holding values - investmentPercentage * investmentTotal
    const holdingValues = holdings.map(holding => holding.investmentPercentage * investmentTotal)

    const companies = await getCompanyNames(holdings)
    // helper function
    const csvs = await generateCsvs(companies, response.data[0], holdingValues)

    // Send headers to set text as a csv file
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=*custom_name*.csv",
    })

    // Send body of data
    res.end(csvs.join(""))
  } catch (error) {
    console.log(`Error in creating csv report: ${error}`)
  }
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})


