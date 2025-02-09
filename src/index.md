---
toc: false
theme: [cotton]
style: style.css
---

```js
const bardata = FileAttachment("data/standards-bar-chart.json").json();
```

<header class="header">
  <div class="logos">
	<div class="logo-image">
		<img height="60px" width="60px" alt="MOMSI WG Logo" src="/images/MOMSI-WG-LOGO.svg">
	</div>
	<div class="logo-text">
		<h1>MOMSI WG Landscape Review Dashboard</h1>
	</div>
  </div>
</header>

<div class="description">
	<p>Welcome one and all</p>
</div>

---

<div class="card">${
    resize((width) => Plot.plot({
      title: "MOMSI WG Landscape Review Live Summary",
      width,
      x: {axis: null, label: "Standard Type"},
      y: {tickFormat: "s", grid: true, label: "Count"},
	  color: {legend: true},
      marks: [
		Plot.barY(bardata, {
		  x: "standard",
		  y: "count",
		  fill: "standard",
		  fx: "type",
		  sort: {x: null, color: null, fx: {value: "-y", reduce: "sum"}}
		}),
		Plot.ruleY([0])
	  ]
    }))
  }</div>

---

```js
import {Mutable} from "observablehq:stdlib";
const data = await FileAttachment("data/database.json").json()
const dataColumns = {
	"genomics": ["Standard Type", "Domain Class/Subclass", "Acronym", "Standard Name", "Status", "Country", "Application Technology", "Plan", "Collect", "Process", "Analysis", "Preservation", "Sharing", "Reuse", "Active Affiliation(s)", "FAIRsharing Record (DOI or URL)", "Identifier"],
	"proteomics": ["Standard Type", "Domain Class/Subclass", "Acronym", "Standard Name", "Status", "Country", "Application Technology", "Plan", "Collect", "Process", "Analysis", "Preservation", "Sharing", "Reuse", "Active Affiliation(s)", "FAIRsharing Record (DOI or URL)", "Identifier"],
	"metabolomics": ["Standard Type", "Domain Class/Subclass", "Acronym", "Standard Name", "Status", "Country", "Application Technology", "Plan", "Collect", "Process", "Analysis", "Preservation", "Sharing", "Reuse", "Active Affiliation(s)", "FAIRsharing Record (DOI or URL)", "Identifier"],
	"universal": ["Standard Type", "Domain Class/Subclass", "Acronym", "Standard Name", "Status", "Country", "Application Technology", "Plan", "Collect", "Process", "Analysis", "Preservation", "Sharing", "Reuse", "Active Affiliation(s)", "FAIRsharing Record (DOI or URL)", "Identifier"]
}
let standardChoice = Mutable("genomics")
let columnChoice = Mutable(dataColumns["genomics"])
let dataChoice = Mutable(data["genomics"])
const dataFormatTemplate = {
	"genomics": "01-genomics-standards.yml",
	"proteomics": "02-proteomics-standards.yml",
	"metabolomics": "03-metabolomics-standards.yml",
	"universal": "04-universal-standards.yml"
}
const dataFormat = {
	"Homepage": url => htl.html`<a href=${url} target=_blank>🔗</a>`,
	"Reference Article Citation (DOI)": url => htl.html`<a href=${url} target=_blank>🔗</a>`,
	"Reference Source Code (DOI or URL)": url => htl.html`<a href=${url} target=_blank>🔗</a>`,
	"FAIRsharing Record (DOI or URL)": url => htl.html`<a href=${url} target=_blank>🔗</a>`,
	"Reference Source Code (URL)": url => htl.html`<a href=${url} target=_blank>🔗</a>`,
	"Identifier": id => htl.html`<a href=https://github.com/whythawk/momsi-tests/issues/new?template=${dataFormatTemplate[standardChoice.value]}&title=[${id}]+Update+submission target=_blank>🖋️ Update</a>`
}

function changeStandardChoice(value) {
	standardChoice.value = value
	columnChoice.value = dataColumns[value]
	return value
}

const choice = view(Inputs.button([
  ["Genomics", value => value = changeStandardChoice("genomics")],
  ["Proteomics", value => value = changeStandardChoice( "proteomics")],
  ["Metabolomics", value => value = changeStandardChoice("metabolomics")],
  ["Universal", value => value = changeStandardChoice("universal")],
], {value: "genomics"}));
const searchGInput = Inputs.search(data["genomics"], {placeholder: "Search genomics standards ..."});
const searchPInput = Inputs.search(data["proteomics"], {placeholder: "Search proteomics standards ..."});
const searchMInput = Inputs.search(data["metabolomics"], {placeholder: "Search metabolomics standards ..."});
const searchUInput = Inputs.search(data["universal"], {placeholder: "Search universal standards ..."});
const searchG = Generators.input(searchGInput);
const searchP = Generators.input(searchPInput);
const searchM = Generators.input(searchMInput);
const searchU = Generators.input(searchUInput);
```

<div class="card" style="display: flex; flex-direction: column; gap: 0.5rem;">
  ${ standardChoice === "genomics" ? searchGInput 
     : standardChoice === "proteomics" ? searchPInput 
	 : standardChoice === "metabolomics" ? searchMInput 
	 : standardChoice === "universal" ? searchUInput : "" }
  ${ standardChoice === "genomics" ? Inputs.table(searchG, {columns: columnChoice, format: dataFormat})
     : standardChoice === "proteomics" ? Inputs.table(searchP, {columns: columnChoice, format: dataFormat})
	 : standardChoice === "metabolomics" ? Inputs.table(searchM, {columns: columnChoice, format: dataFormat})
	 : standardChoice === "universal" ? Inputs.table(searchU, {columns: columnChoice, format: dataFormat})
	 : "" }
</div>

