/**
 * Gefið efni fyrir verkefni 9, ekki er krafa að nota nákvæmlega þetta en nota
 * verður gefnar staðsetningar.
 */

import { el, empty } from "./lib/elements.js";
import { weatherSearch } from "./lib/weather.js";

/**
 * @typedef {Object} SearchLocation
 * @property {string} title
 * @property {number} lat
 * @property {number} lng
 */

/**
 * Allar staðsetning sem hægt er að fá veður fyrir.
 * @type Array<SearchLocation>
 */
const locations = [
  {
    title: "Reykjavík",
    lat: 64.1355,
    lng: -21.8954,
  },
  {
    title: "Akureyri",
    lat: 65.6835,
    lng: -18.0878,
  },
  {
    title: "New York",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    title: "Tokyo",
    lat: 35.6764,
    lng: 139.65,
  },
  {
    title: "Sydney",
    lat: 33.8688,
    lng: 151.2093,
  },
];

/**
 * Hreinsar fyrri niðurstöður, passar að niðurstöður séu birtar og birtir element.
 * @param {Element} element
 */
function renderIntoResultsContent(element) {
	const class_name = `.${element.attributes.getNamedItem("class").value}`;

	if(document.querySelector(class_name))
	{
		console.log("element already exists");
		empty(document.querySelector(class_name));
		document.querySelector(".weather").removeChild(document.querySelector(class_name));
	}
	
	document.querySelector(".weather").appendChild(element);

}

/**
 * Birtir niðurstöður í viðmóti.
 * @param {SearchLocation} location
 * @param {Array<import('./lib/weather.js').Forecast>} results
 */
function renderResults(location, results) {
	const table_body = el("tbody", {});
	const data = results.hourly;
	for(let i = 0; i < data.time.length; i++)
	{
		
		const row = {
			t_in_hours: data.time[i].split("T")[1],
			temp: data.temperature_2m[i],
			precipitation: data.precipitation[i]
		};

		const table_row = el("tr", {}, 
				 	el("td", {}, `${row.t_in_hours}`),
					el("td", {}, `${row.temp}`),
					el("td", {}, `${row.precipitation}`));
		table_body.appendChild(table_row);
	}

	const table = el("table", {class: "forecast"},
			el("thead", {},
				el("tr", {}, 
				el("th", {}, "Klukkustundir"),
				el("th", {}, "Hitastig"),
				el("th", {}, "Úrkoma"))),
			table_body);
	
	renderIntoResultsContent(table);
}

/**
 * Birta villu í viðmóti.
 * @param {Error} error
 */
function renderError(error) {
	const error_element = el("h2", {class: "forecast"}, `Error ${error.code}: ${error.message}`);
	console.error(`error ${error.code}: ${error.message}`);

	document.querySelector("h1").innerHTML = "ERROR"

	renderIntoResultsContent(error_element);
}

/**
 * Birta biðstöðu í viðmóti.
 */
function renderLoading() {
  console.log("render loading");
	document.querySelector("h1").innerHTML = "Loading...";
}

/**
 * Framkvæmir leit að veðri fyrir gefna staðsetningu.
 * Birtir biðstöðu, villu eða niðurstöður í viðmóti.
 * @param {SearchLocation} location Staðsetning sem á að leita eftir.
 */
async function onSearch(location) {
  console.log("onSearch", location);

  // Birta loading state
  renderLoading();

  const results = await weatherSearch(location.lat, location.lng);

	document.querySelector("h1").innerHTML = `${location.title} ${location.lat} ${location.lng}`;

  console.log(results.hourly);
  // TODO útfæra
  // Hér ætti að birta og taka tillit til mismunandi staða meðan leitað er.
	renderResults(location, results);
}

/**
 * Framkvæmir leit að veðri fyrir núverandi staðsetningu.
 * Biður notanda um leyfi gegnum vafra.
 */
async function onSearchMyLocation(location) {
  
	var crd = location.coords;

	console.log(crd.latitude);

	renderLoading();
	const results = await weatherSearch(crd.lat, crd.lng);

	document.querySelector("h1").innerHTML = `${crd.lat} ${crd.lng}`;

	renderResults(location, results);
}

/**
 * Býr til takka fyrir staðsetningu.
 * @param {string} locationTitle
 * @param {() => void} onSearch
 * @returns {HTMLElement}
 */
function renderLocationButton(locationTitle, onSearch) {
  // Notum `el` fallið til að búa til element og spara okkur nokkur skref.
  const locationElement = el(
    "li",
    { class: "locations__location" },
    el(
      "button",
      { class: "locations__button", click: onSearch },
      locationTitle,
    ),
  );

  /* Til smanburðar við el fallið ef við myndum nota DOM aðgerðir
  const locationElement = document.createElement('li');
  locationElement.classList.add('locations__location');
  const locationButton = document.createElement('button');
  locationButton.appendChild(document.createTextNode(locationTitle));
  locationButton.addEventListener('click', onSearch);
  locationElement.appendChild(locationButton);
  */

  return locationElement;
}

/**
 * Býr til grunnviðmót: haus og lýsingu, lista af staðsetningum og niðurstöður (falið í byrjun).
 * @param {Element} container HTML element sem inniheldur allt.
 * @param {Array<SearchLocation>} locations Staðsetningar sem hægt er að fá veður fyrir.
 * @param {(location: SearchLocation) => void} onSearch
 * @param {() => void} onSearchMyLocation
 */

var getMyPosition = (onSearchMyLocation) => { navigator.geolocation.getCurrentPosition(onSearchMyLocation, renderError); };

function render(container, locations, onSearch, onSearchMyLocation) {
  // Búum til <main> og setjum `weather` class
  const parentElement = document.createElement("main");
  parentElement.classList.add("weather");

  // Búum til <header> með beinum DOM aðgerðum
  const headerElement = document.createElement("header");
  const heading = document.createElement("h1");
  heading.appendChild(document.createTextNode(""));
  headerElement.appendChild(heading);
  parentElement.appendChild(headerElement);

  // TODO útfæra inngangstexta
  // Búa til <div class="loctions">
  const locationsElement = document.createElement("div");
  locationsElement.classList.add("locations");

  // Búa til <ul class="locations__list">
  const locationsListElement = document.createElement("ul");
  locationsListElement.classList.add("locations__list");

  // <div class="loctions"><ul class="locations__list"></ul></div>
  locationsElement.appendChild(locationsListElement);

	getMyPosition(onSearchMyLocation);

  const myLocationButton = renderLocationButton("My location", () => {getMyPosition(onSearchMyLocation)});
  locationsListElement.appendChild(myLocationButton);
  // <div class="loctions"><ul class="locations__list"><li><li><li></ul></div>
  for (const location of locations) {
    const liButtonElement = renderLocationButton(location.title, () => {
      console.log("Halló!!", location);
      onSearch(location);
    });
    locationsListElement.appendChild(liButtonElement);
  }

  parentElement.appendChild(locationsElement);

  // TODO útfæra niðurstöðu element

  container.appendChild(parentElement);
}

// Þetta fall býr til grunnviðmót og setur það í `document.body`
render(document.body, locations, onSearch, onSearchMyLocation);
