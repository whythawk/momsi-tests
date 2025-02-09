const fs = require('fs')

// IMPORTS

const eventPayload = require(process.env.GITHUB_EVENT_PATH)
let submission = JSON.parse(fs.readFileSync('submission.json', 'utf-8'))
let data = JSON.parse(fs.readFileSync('./src/data/database.json', 'utf-8'))
const standard = String(fs.readFileSync('submitter.txt', 'utf-8')).trim().toLowerCase()
const title = eventPayload.issue.title.trim()
const contributor = eventPayload.issue.user.login

// CONSTANTS

const STANDARDS = ["Genomics", "Proteomics", "Metabolomics", "Universal"]
const INDICATORS = {
    "genomics": "MOMSI_G",
    "proteomics": "MOMSI_P",
    "metabolomics": "MOMSI_M",
    "universal": "MOMSI_U",
}
const REPLACEMAP = { 
	"standard-type": "Standard Type",
	"status": "Status",
	"country": "Country",
	"domain-class-subclass": "Domain Class/Subclass",
	"application-technology": "Application Technology",
	"standard-name": "Standard Name",
	"acronym": "Acronym",
	"plan": "Plan",
	"collect": "Collect",
	"process": "Process",
	"analysis": "Analysis",
	"preservation": "Preservation",
	"sharing": "Sharing",
	"reuse": "Reuse",
	"meets-criteria": "Meets Criteria",
	"active-affiliations": "Active Affiliation(s)",
	"homepage": "Homepage",
	"reference-article-citation-doi": "Reference Article Citation (DOI)",
	"reference-source-code-doi": "Reference Source Code (DOI or URL)",
	"fairsharing-record-doi": "FAIRsharing Record (DOI or URL)",
}
const LEADINGZEROS = 5

// UPDATE DATABASE

function initialiseDataIndex(data) {
	// Check that database is properly indexed, and index if it isn't
	// Deprecated as not necessary here
	for (const term of STANDARDS) {
		if (data[term.toLowerCase()].length && !data[term.toLowerCase()][0].hasOwnProperty("Identifier")) {
			data[term.toLowerCase()] = data[term.toLowerCase()].map((item, index) => ({ ...item, identifier: `${getFormalIdentifier(index + 1, term)}`}))
		}
	}
	return data
}

function replaceKeyInObjectArray(data, replaceMap = REPLACEMAP) {
	// Remap the keys from the GitHub template to those of the database
	// https://stackoverflow.com/a/27806458
	return Object.keys(data).map((key) => ({ [replaceMap[key] || key] : data[key] })).reduce((data, b) => Object.assign({}, data, b))
}

function getFormalIdentifier(num, term = standard, length = LEADINGZEROS) {
	// Generate an appropriately-formatted identifier with leading zeros
	// ref: https://javascripts.com/pad-leading-zeros-in-javascript/
	num = num.toString()
	while(num.length < length) {
		num = '0' + num
	}
	return `${INDICATORS[term]}:${num}`
}

function checkIdentifier(title = title, submission = submission, data = data, term = standard, contributor = null) {
  // If the title refers to an existing Standard, then update that entirely
  // Else generate a new identifier and push that to the database
  submission["Contributor"] = contributor
  if (submission.hasOwnProperty("comments")) delete submission.comments
  console.log("TITLE:", title)
  if (title.startsWith(`[${INDICATORS[term]}:`)) {
	  submission["Identifier"] = title.slice(1,14)
	  // https://stackoverflow.com/a/39529049
	  const indexOfTerm = data[term].findIndex(item => item.Identifier === submission.Identifier)
	  if (indexOfTerm !== -1) {
		  data[term][indexOfTerm] = submission
		  return data
	  }
  }
  // Default, create an identifier and append
  submission["Identifier"] = getFormalIdentifier(data[term].length)
  data[term].push(submission)
  return data
}

submission = replaceKeyInObjectArray(submission, REPLACEMAP)
data = checkIdentifier(title, submission, data, standard, contributor)
fs.writeFileSync('./src/data/database.json', JSON.stringify(data, null, '  '));