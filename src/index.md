---
toc: false
theme: [cotton]
---

```js
const agg = FileAttachment("data/vizibase.json").json();
```

<div class="hero">
  <h1>MOMSI Dashboard</h1>
  <h2>Welcome to your new app!</h2>
</div>

<!-- Cards with big numbers -->

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Genomics</h2>
    <span class="big">${agg.children.find((s) => s.name === "Genomics").count}</span>
  </div>
  <div class="card">
    <h2>Proteomics</h2>
    <span class="big">${agg.children.find((s) => s.name === "Proteomics").count}</span>
  </div>
  <div class="card">
    <h2>Metabolomics</h2>
    <span class="big">${agg.children.find((s) => s.name === "Metabolomics").count}</span>
  </div>
  <div class="card">
    <h2>Universal</h2>
    <span class="big">${agg.children.find((s) => s.name === "Universal").count}</span>
  </div>
</div>

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
  ${ standardChoice === "genomics" ? Inputs.table(searchG, {columns: columnChoice}) 
     : standardChoice === "proteomics" ? Inputs.table(searchP, {columns: columnChoice}) 
	 : standardChoice === "metabolomics" ? Inputs.table(searchM, {columns: columnChoice}) 
	 : standardChoice === "universal" ? Inputs.table(searchU, {columns: columnChoice}) : "" }
</div>

---

<div class="grid grid-cols-2" style="grid-auto-rows: 504px;">
  <div class="card">${
    resize((width) => Plot.plot({
      title: "Your awesomeness over time 🚀",
      subtitle: "Up and to the right!",
      width,
      y: {grid: true, label: "Awesomeness"},
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(aapl, {x: "Date", y: "Close", tip: true})
      ]
    }))
  }</div>
  <div class="card">${
    resize((width) => Plot.plot({
      title: "How big are penguins, anyway? 🐧",
      width,
      grid: true,
      x: {label: "Body mass (g)"},
      y: {label: "Flipper length (mm)"},
      color: {legend: true},
      marks: [
        Plot.linearRegressionY(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species"}),
        Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species", tip: true})
      ]
    }))
  }</div>
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
