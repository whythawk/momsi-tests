const fs = require('fs')
const eventPayload = require(process.env.GITHUB_EVENT_PATH)
const standard = String(fs.readFileSync('submitter.txt', 'utf-8')).trim()
const title = eventPayload.issue.title
const creator = eventPayload.issue.user.login
let submission = JSON.parse(fs.readFileSync('order.json', 'utf-8'))
let data = JSON.parse(fs.readFileSync('./src/data/data.json', 'utf-8'))
const leadingZeros = 5
const terms = ["burgers", "pizzas"]
const prefix = {
	"burgers": "ORDER_B:",
	"pizzas": "ORDER_P:"
}

function initialiseDataIndex(data) {
	// Check that database is properly indexed, and index if it isn't
	for (const term of terms) {
		if (data[term].length && !data[term][0].hasOwnProperty("identifier")) {
			data[term] = data[term].map((item, index) => ({ ...item, identifier: `${getFormalIdentifier(index + 1, term)}`}))
		}
	}
	return data
}

function getFormalIdentifier(num, term = standard, length = leadingZeros) {
	// Generate an appropriately-formatted identifier with leading zeros
	// ref: https://javascripts.com/pad-leading-zeros-in-javascript/
	num = num.toString()
	while(num.length < length) {
		num = '0' + num
	}
	return `${prefix[term]}:${num}`
}

function checkIdentifier(title = title, submission = submission, data = data, term = standard) {
  // If the title refers to an existing Standard, then update that entirely
  // Else generate a new identifier and push that to the database
  if (title.startsWith(`[${prefix[term]}:`)) {
	  submission["identifier"] = title.slice(1,13)
	  // https://stackoverflow.com/a/39529049
	  const indexOfTerm = data[standard].findIndex(item => iterm.identifier === submission.identifier)
	  if (indexOfTerm) {
		  submission["identifier"] = identifier
		  data[standard][indexOfTerm] = submission
		  return data
	  }
  }
  // Default, create an identifier and append
  submission["identifier"] = getFormalIdentifier(data[standard].length + 1)
  data[standard].push(submission)
  return data
}

const user = eventPayload.sender.login;
const [flavour, size, toppings, count] = Object.values(submission);
const amount = parseInt(count.slice(0,3), 10) || 1;
const content = `1. [@${user}](https://github.com/${user}) orders ${amount} ${size} ${flavour} burger with ${toppings}\n`;

data = initialiseDataIndex(data)
data = checkIdentifier(title, submission, data, standard)
fs.writeFileSync('./src/data/data.json', JSON.stringify(data, null, '  '))

fs.appendFileSync('README.md', content);