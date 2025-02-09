const fs = require('fs')

// IMPORTS

let data = JSON.parse(fs.readFileSync('./src/data/database.json', 'utf-8'))

// CONSTANTS

const STANDARDS = ["Genomics", "Proteomics", "Metabolomics", "Universal"]
const LIFECYCLE = ["Plan", "Collect", "Process", "Analysis", "Preservation", "Sharing", "Reuse"]
const STANDARDTYPES = ["Reporting Guideline", "Terminology artefact", "Model/Format", "Identifier Schema", "Multi-Standard Applicable"]
const MULTIPLE_PERMITTED = ["Domain Class/Subclass", "Application Technology"]

const STANDARDS_AGGREGATION = {
    "name": "Standards",
    "children": [],
    "count": 0
}

// FUNCTIONS

function buildVerboseData(data, multipleField) {
	// Split values of `multipleField` and regenerate the data
	// If `multipleField` isn't in the object, can skip since it
	// won't be in the hierarchy anyway
	const verboseData = []
	for (const d of data) {
		if (d.hasOwnProperty(multipleField)) {
			const values = d[multipleField].split(",")
			for (const v of values) {
				const clone = structuredClone(d)
				d[multipleField] = v.trim()
				verboseData.push(d)
			}
		}
	}
	return verboseData
}

function getStandardCounts(subclassTerm, data, countField = "Standard Name") {
	// Get the counts for the "Standard Name" field
	let counts = {}
	const filteredTerms = data.filter((item) => item["Standard Type"] === subclassTerm)
	for (const term of filteredTerms.map(item => item[countField])) {
		if (counts.hasOwnProperty(term)) counts[term] += 1
		else counts[term] = 1
	}
	return counts
}

function getUniqueCycleTerms(data, cycleField, standards = STANDARDS) {
	let uniqueCycleTerms = new Set()
	for (const standard of STANDARDS) {
		data[standard.toLowerCase()].forEach(item => uniqueCycleTerms.add(item[cycleField]))
	}
	return uniqueCycleTerms
}

function rebuildClusterTreeAggregations(data, aggregation = STANDARDS_AGGREGATION) {
	// Cluster Tree: Standards ["Genomics", "Proteomics / Metabolomics"] -> "Domain Class/Subclass" (split)
	//				 -> Status -> Standard Types -> Acronyms
	// https://observablehq.com/@d3/cluster/2
	for (const standard of STANDARDS) {
		const standardChild = {
			name: standard,
			children: [],
			count: 0
		}
		// Build the hierarchy: "Domain Class/Subclass", "Standard Type", "Standard Name"
		const verboseData = buildVerboseData(data[standard.toLowerCase()], "Domain Class/Subclass")
		let classTerms = verboseData.map(item => item["Domain Class/Subclass"])
		for (const classTerm of [...new Set(classTerms)]) {
			const classChild = {
				name: classTerm,
				children: [],
				count: 0
			}
			const filteredSubClass = verboseData.filter((item) => item["Domain Class/Subclass"] === classTerm)
			const subClassTerms = filteredSubClass.map(item => item["Standard Type"])
			for (const subClassTerm of [...new Set(subClassTerms)]) {
				const subClassChild = {
					name: subClassTerm,
					children: [],
					count: 0
				}
				for (const [k, v] of Object.entries(getStandardCounts(subClassTerm, filteredSubClass, "Acronym"))) {
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

function rebuildSunburstAggregations(data, aggregation = STANDARDS_AGGREGATION) {
	// Zoomable sunburst: Data Lifecycle -> Lifecycle Term -> Standards -> Standard Types -> Acronyms
	// https://observablehq.com/@d3/zoomable-sunburst
	for (const cycle of LIFECYCLE) {
		const cycleChild = {
			name: cycle,
			children: [],
			count: 0
		}
		const cycleTerms = getUniqueCycleTerms(data, cycle)
		for (const cycleTerm of cycleTerms) {
			const cycleTermChild = {
				name: cycleTerm,
				children: [],
				count: 0
			}
			for (const standard of STANDARDS) {
				const standardChild = {
					name: standard,
					children: [],
					count: 0
				}
				const filteredCycle = data[standard.toLowerCase()].filter((item) => item[cycle] === cycleTerm)
				// Build the hierarchy: "Standard Type", "Acronym"
				let classTerms = filteredCycle.map(item => item["Standard Type"])
				for (const classTerm of [...new Set(classTerms)]) {
					const classChild = {
						name: classTerm,
						children: [],
						count: 0
					}
					for (const [k, v] of Object.entries(getStandardCounts(classTerm, data[standard.toLowerCase()], "Acronym"))) {
						classChild.count += v
						classChild.children.push({
							name: k,
							count: v
						})
					}
					standardChild.count += classChild.count
					standardChild.children.push(classChild)
				}
				cycleTermChild.count += standardChild.count
				cycleTermChild.children.push(standardChild)
			}
			cycleChild.count += cycleTermChild.count
			cycleChild.children.push(cycleTermChild)
		}
		aggregation.count += cycleChild.count
		aggregation.children.push(cycleChild)
	}
	return aggregation
}

function rebuildCirclePackingAggregations(data, aggregation = STANDARDS_AGGREGATION) {
	// Circle packing: Standards -> Standard Types -> Acronyms
	// https://observablehq.com/@d3/zoomable-circle-packing
	for (const standard of STANDARDS) {
		const standardChild = {
			name: standard,
			children: [],
			count: 0
		}
		// Build the hierarchy: "Standard Type", "Acronym"
		let classTerms = data[standard.toLowerCase()].map(item => item["Standard Type"])
		for (const classTerm of [...new Set(classTerms)]) {
			const classChild = {
				name: classTerm,
				children: [],
				count: 0
			}
			for (const [k, v] of Object.entries(getStandardCounts(classTerm, data[standard.toLowerCase()], "Acronym"))) {
				classChild.count += v
				classChild.children.push({
					name: k,
					count: v
				})
			}
			standardChild.count += classChild.count
			standardChild.children.push(classChild)
		}
		aggregation.count += standardChild.count
		aggregation.children.push(standardChild)
	}
	return aggregation
}

function rebuildBarChartAggregations(data, standards = STANDARDS, standardTypes = STANDARDTYPES) {
	// Standards grouped bar chart
	// https://observablehq.com/@observablehq/plot-grouped-bar-chart
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

// BUILD VISUALISATION AGGREGATIONS

let aggregation

aggregation = rebuildCirclePackingAggregations(data, structuredClone(STANDARDS_AGGREGATION))
fs.writeFileSync('./src/data/circle-packing-chart.json', JSON.stringify(aggregation, null, '  '));

aggregation = rebuildSunburstAggregations(data, structuredClone(STANDARDS_AGGREGATION))
fs.writeFileSync('./src/data/sunburst-chart.json', JSON.stringify(aggregation, null, '  '));

aggregation = rebuildClusterTreeAggregations(data, structuredClone(STANDARDS_AGGREGATION))
fs.writeFileSync('./src/data/cluster-chart.json', JSON.stringify(aggregation, null, '  '));

aggregation = rebuildBarChartAggregations(data, STANDARDS, STANDARDTYPES)
fs.writeFileSync('./src/data/standards-bar-chart.json', JSON.stringify(aggregation, null, '  '));