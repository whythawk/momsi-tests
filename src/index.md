---
toc: false
theme: [cotton]
---

```js
const typdata = FileAttachment("data/typebase.json").json();
```

<div class="hero">
  <h1>MOMSI Dashboard</h1>
  <h2>Welcome to your new app!</h2>
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
		Plot.barY(typdata, {
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
	"genomics": ["Standard Name", "Acronym", "Standard Type", "Status", "Country", "Domain Class/Subclass", "Application Technology", "Plan", "Collect", "Process", "Analysis", "Preservation", "Sharing", "Reuse", "Meets Criteria", "Active Affiliation(s)", "Homepage", "Reference Article Citation (DOI)", "Reference Source Code (DOI or URL)", "FAIRsharing Record (DOI or URL)", "Identifier"],
	"proteomics": ["Standard Name", "Acronym", "Standard Type", "Status", "Country", "Domain Class/Subclass", "Application Technology", "Description", "Plan", "Collect", "Process", "Analysis", "Preservation", "Sharing", "Reuse", "Meets Criteria", "Active Affiliation(s)", "Homepage", "Reference Article Citation (DOI)", "Reference Source Code (DOI or URL)", "FAIRsharing Record (DOI or URL)", "Identifier"],
	"metabolomics": ["Standard Name", "Acronym", "Standard Type", "Status", "Country", "Domain Class/Subclass", "Application Technology", "Plan", "Collect", "Process", "Analysis", "Preservation", "Sharing", "Reuse", "Meets Criteria", "Active Affiliation(s)", "Homepage", "Reference Article Citation (DOI)", "Reference Source Code (URL)", "FAIRsharing Record (DOI or URL)", "Identifier"],
	"universal": ["Standard Name", "Acronym", "Standard Type", "Status", "Country", "Domain Class/Subclass", "Plan", "Collect", "Process", "Analysis", "Preservation", "Sharing", "Reuse", "Meets Criteria", "Active Affiliation(s)", "Homepage", "Reference Article Citation (DOI)", "Reference Source Code (DOI or URL)", "FAIRsharing Record (DOI or URL)", "Identifier"]
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

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 1rem 0 1rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 0.5rem 0;
  padding: 0.5rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 50px;
  }
}

</style>
