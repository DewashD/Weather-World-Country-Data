const width = 960;
const height = 600;
let timer;
let currentScale = 250;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// 1. Setup Projection
const projection = d3.geoOrthographic()
    .scale(currentScale)
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .rotate([0, -20]);

const path = d3.geoPath().projection(projection);

// 2. LAYER 1: The Ocean (Background)
const ocean = svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", projection.scale())
    .attr("fill", "#a2d0f1"); // Your blue color

// 3. LAYER 2: The Land Group (On top of ocean)
const g = svg.append("g");

Promise.all([
    d3.json("https://unpkg.com/world-atlas@2/world/110m.json"),
    fetch("https://restcountries.com/v3.1/all?fields=name,flags,capital,region,subregion,population,languages,currencies,cca3,ccn3")
        .then(r => r.json())
]).then(([worldData, countriesInfo]) => {

    const countries = topojson.feature(worldData, worldData.objects.countries).features;

    const land = g.selectAll(".country")
        .data(countries)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", "#d2d2d2") // Default grey land
        .attr("stroke", "#ffffff") // White borders
        .attr("stroke-width", "0.5px")
        .on("click", function(event, d) {
            // Reset all countries to default color
            g.selectAll(".country").attr("fill", "#d2d2d2");

            // Highlight THIS country red
            d3.select(this).attr("fill", "#ff4d4d");

            const country = countriesInfo.find(c =>
                c.ccn3 === d.id.toString().padStart(3, '0')
            );
            if (country) displayCountryInfo(country);
        });

    // --- Interactions ---

    const zoom = d3.zoom()
        .scaleExtent([0.5, 8])
        .on("zoom", (event) => {
            projection.scale(currentScale * event.transform.k);
            ocean.attr("r", projection.scale());
            g.selectAll("path").attr("d", path);
        });

    const drag = d3.drag()
        .on("start", () => timer.stop())
        .on("drag", (event) => {
            const rotate = projection.rotate();
            const k = 75 / projection.scale();
            projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
            g.selectAll("path").attr("d", path);
        });

    svg.call(drag).call(zoom);

    // Auto-spin
    timer = d3.timer(() => {
        const rotate = projection.rotate();
        projection.rotate([rotate[0] + 0.2, rotate[1]]);
        g.selectAll("path").attr("d", path);
    });

}).catch(err => console.error(err));

function displayCountryInfo(country) {
    const details = document.getElementById("details");
    details.innerHTML = `
        <img src="${country.flags.png}" alt="Flag" width="120" style="box-shadow: 2px 2px 5px #ccc">
        <h3>${country.name.common}</h3>
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : "N/A"}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
    `;
}