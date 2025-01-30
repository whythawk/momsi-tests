const fs = require('fs')

// IMPORTS

const eventPayload = require(process.env.GITHUB_EVENT_PATH)
let submission = JSON.parse(fs.readFileSync('submission.json', 'utf-8'))
let data = JSON.parse(fs.readFileSync('./src/data/database.json', 'utf-8'))
const standard = String(fs.readFileSync('submitter.txt', 'utf-8')).trim().toLowerCase()
const title = eventPayload.issue.title
const contributor = eventPayload.issue.user.login

// CONSTANTS

const STANDARDS = ["Genomics", "Proteomics", "Metabolomics", "Universal"]
const STANDARDTYPES = ["Reporting Guideline", "Terminology artefact", "Model/Format", "Identifier Schema", "Multi-Standard Applicable"]
const STANDARDTERMS = ["genomics", "proteomics", "metabolomics", "universal"]
const INDICATORS = {
    "genomics": "MOMSI_G",
    "proteomics": "MOMSI_P",
    "metabolomics": "MOMSI_M",
    "universal": "MOMSI_U",
}
const LEADINGZEROS = 5

// UPDATE DATABASE

function initialiseDataIndex(data) {
	// Check that database is properly indexed, and index if it isn't
	for (const term of STANDARDS) {
		if (data[term.toLowerCase()].length && !data[term.toLowerCase()][0].hasOwnProperty("Identifier")) {
			data[term.toLowerCase()] = data[term.toLowerCase()].map((item, index) => ({ ...item, identifier: `${getFormalIdentifier(index + 1, term)}`}))
		}
	}
	return data
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
  if (submission.hasOwnProperty("Comment")) delete submission.Comment
  if (title.startsWith(`[${INDICATORS[term]}:`)) {
	  submission["Identifier"] = title.slice(1,14)
	  // https://stackoverflow.com/a/39529049
	  const indexOfTerm = data[standard].findIndex(item => item.Identifier === submission.Identifier)
	  if (indexOfTerm) {
		  data[standard][indexOfTerm] = submission
		  return data
	  }
  }
  // Default, create an identifier and append
  submission["Identifier"] = getFormalIdentifier(data[standard].length + 1)
  data[standard].push(submission)
  return data
}

data = initialiseDataIndex(data)
data = checkIdentifier(title, submission, data, standard, contributor)
fs.writeFileSync('./src/data/database.json', JSON.stringify(data, null, '  '));

// BUILD VISUALISATION AGGREGATIONS

const STANDARDS_AGGREGATION = {
    "name": "Standards",
    "children": [],
    "count": 0
}

function getStandardCounts(classTerm, subclassTerm, data) {
	let counts = {}
	const filteredTerms = data.filter((item) => item["Domain Class/Subclass"] === classTerm && item["Standard Type"] === subclassTerm)
	for (const term of filteredTerms.map(item => item["Standard Name"])) {
		if (counts.hasOwnProperty(term)) counts[term] += 1
		else counts[term] = 1
	}
	return counts		
}

function rebuildVisualisationAggregations(data, aggregation = STANDARDS_AGGREGATION) {
	for (const standard of STANDARDS) {
		const standardChild = {
			name: standard,
			children: [],
			count: 0
		}
		// Build the hierarchy: "Domain Class/Subclass", "Standard Type", "Standard Name"
		let classTerms = data[standard.toLowerCase()].map(item => term["Domain Class/Subclass"])
		for (const classTerm of [...new Set(classTerms)]) {
			const classChild = {
				name: classTerm,
				children: [],
				count: 0
			}
			const filteredSubClass = data[standard.toLowerCase()].filter((item) => item["Domain Class/Subclass"] === classTerm)
			const subClassTerms = filteredSubClass.map(item => item["Domain Class/Subclass"])
			for (const subClassTerm of [...new Set(subClassTerms)]) {
				const subClassChild = {
					name: subClassTerm,
					children: [],
					count: 0
				}
				for (const [k, v] of Object.entries(getStandardCounts(classTerm, subclassTerm, filteredSubClass))) {
					subClassChild.count += v
					subClassChild.children.push({
						name: k,
						count: v
					})
				}
				classChild.count += subClassChild.count
				classChild.children.push(subClassChild)
			}
			standardChild.count += classChild.count
			standardChild.children.push(classChild)
		}
		aggregation.count += standardChild.count
		aggregation.children.push(standardChild)
	}
	return aggregation
}

function rebuildTypesAggregations(data, standards = STANDARDS, standardTypes = STANDARDTYPES) {
	let aggregation = []
	for (const stype of standardTypes) {
		for (const std of standards) {
			const count = data[std.toLowerCase()].filter((item) => item["Standard Type"] === stype).length
			aggregation.push({
				"type": stype,
				"standard": std,
				"count": count
			})
		}
	}
	return aggregation
}

let aggregation = rebuildVisualisationAggregations(data, STANDARDS_AGGREGATION)
fs.writeFileSync('./src/data/vizibase.json', JSON.stringify(data, null, '  '));

aggregation = rebuildTypesAggregations(data, STANDARDS, STANDARDTYPES)
fs.writeFileSync('./src/data/typebase.json', JSON.stringify(data, null, '  '));