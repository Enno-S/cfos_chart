/* jshint esversion: 6 */
/* jshint -W097 */ // Use the function form of "strict"

"use strict";


let Vue = window.Vue;
let Chart = window.Chart;


const tailLengths = [7, 28, 91, null, null];
const colors = [
    '#FF2E00',
    '#FEA82F',
    '#60D394',
    '#4D9DE0',
    '#785589',
];
const labelStyles = colors.map(color => 'color: ' + color);
const inputStyles = colors.map(color => 'color: ' + color + '; border-color: ' + color);



const points1 = [];
const points2 = [[], [], [], [], []];
let myChart;
let vue;


function updatePoints2(index, tailLength) {
    points2[index].length = 0;
    for (let i = 0; i < points1.length; i++) {
        let x = points1[i].x;
        let y;
        if (i < tailLength) {
            y = null;
        }
        else {
            y = 0;
            for (let j = 0; j < tailLength; j++) {
                y += points1[i - j].y;
            }
            y = (y / tailLength).toFixed(2);
        }
        points2[index].push({x, y});
    }

}

function updatePoints1AndPoints2(datesAndValues) {
    points1.length = 0;
    datesAndValues.forEach(({date, value}) =>
        points1.push({x: date, y: value})
    );
    for (let i = 0; i < 5; i++) {
        points2[i].length = points1.length;
        updatePoints2(i, tailLengths[i]);
    }
}

function createDatasets() {
    let datasets = [{
        label: 'Units Sold',
        data: points1,
        fill: false,
        borderColor: '#505050',
        backgroundColor: '#505050',
    }];
    for (let i = 0; i < 5; i++) {
        datasets.push({
            label: 'MA' + (i + 1),
            data: points2[i],
            fill: false,
            borderColor: colors[i],
            backgroundColor: colors[i],
        });
    }
    return datasets;
}

function createConfig(datasets) {
    return {
        type: 'line',
        data: {
            datasets,
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: "time",
                    time: {
                        format: 'YYYY-MM-DD',
                        unit: 'month'
                    },
                    ticks: {
                        align: 'start',
                    }
                },
            }
        }
    };
}

function createChart() {
    fetch("data.json").then(response => response.text()).then(json => {
        vue.jsonNew = json;
        updatePoints1AndPoints2(JSON.parse(json));
        const datasets = createDatasets();
        const config = createConfig(datasets);
        Chart.defaults.font.family = 'Roboto, sans-serif';
        Chart.defaults.font.weight = 'bold';
        Chart.defaults.font.size = window.matchMedia('only screen and (hover: none) and (pointer: coarse)').matches ? 30 : 20;

        myChart = new Chart(
            document.getElementById('myChart'),
            config
        );
    });
}

function processJSONNew(jsonNew) {
    let isWellFormed;
    try {
        let datesAndValues = JSON.parse(jsonNew);
        isWellFormed = true;
        updatePoints1AndPoints2(datesAndValues);
        myChart.update('none');
    } catch (e) {
        isWellFormed = false;
    }
    return {
        jsonStatus: (isWellFormed ? "JSON data OK" : "JSON data not well-formed"),
        jsonStatusClass: (isWellFormed ? "jsonGood" : "jsonBad")
    };
}

function createVue() {
    return new Vue({
        el: '#app',
        data: {
            tailLengths,
            labelStyles,
            inputStyles,
            jsonNew: null,
            jsonStatus: null,
            jsonStatusClass: null
        },
        watch: {
            tailLengths() {
                // alert(JSON.stringify(points2));
                for (let i = 0; i < 5; i++) {
                    updatePoints2(i, this.tailLengths[i]);
                }
                // alert(JSON.stringify(points2));
                myChart.update('none');
            },
            jsonNew() {
                let { jsonStatus, jsonStatusClass } = processJSONNew(this.jsonNew);
                this.jsonStatus = jsonStatus;
                this.jsonStatusClass = jsonStatusClass;
            }
        },
    });
}

vue = createVue();
createChart();