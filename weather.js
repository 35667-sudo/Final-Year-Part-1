let chart; // Declare the chart variable globally

document.getElementById('weatherReport').addEventListener('click', function () {
    const coordinates = localStorage.getItem("polygoncoord");
    console.log("polygoncoord", coordinates);

    let coordinatesArray;

    if (coordinates.startsWith('[') || coordinates.startsWith('{')) {
        // If the string is JSON, parse it
        coordinatesArray = JSON.parse(coordinates);
    } else {
        // If the string is comma-separated, split it
        coordinatesArray = coordinates.split(',').map(coord => parseFloat(coord));
    }
    const lat = parseFloat(coordinatesArray[0]);
    const lon = parseFloat(coordinatesArray[1]);
    const apiKey = '8fe0250d67259f443d53736d749778b9';

    // Check screen width
    const screenWidth = window.innerWidth;
    const daysToDisplay = screenWidth < 450 ? 7 : 16;

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&units=metric&cnt=${daysToDisplay}&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const weatherData = data.list;
            if (!weatherData || !Array.isArray(weatherData) || weatherData.length === 0) {
                throw new Error('No weather data available');
            }
            console.log(weatherData);

            // Destroy the existing chart if it exists
            if (chart) {
                chart.destroy();
            }

            const icons = {
                Clear: 'https://img.icons8.com/emoji/48/000000/sun-emoji.png',
                Clouds: 'https://img.icons8.com/emoji/48/000000/cloud-emoji.png',
                Rain: 'https://img.icons8.com/emoji/48/000000/cloud-with-rain-emoji.png'
            };

            const loadedIcons = {};
            for (const condition in icons) {
                const img = new Image();
                img.src = icons[condition];
                loadedIcons[condition] = img;
            }

            const ctx = document.getElementById('weatherChart').getContext('2d');
            const getWindDirection = (degrees) => {
                const directions = ['North', 'NorthEast', 'East', 'SouthEast', 'South', 'SouthWest', 'West', 'NorthWest'];
                const index = Math.round((degrees % 360) / 45) % 8;
                return directions[index];
            }

            let labels, maxTemps, minTemps, windSpeeds, windDirections, weatherConditions, humidities, rainData;

            labels = weatherData.map(entry => moment.unix(entry.dt).format('DD MMM'));
            maxTemps = weatherData.map(entry => entry.temp.max); // Convert from Kelvin to Celsius
            minTemps = weatherData.map(entry => entry.temp.min); // Convert from Kelvin to Celsius
            windSpeeds = weatherData.map(entry => entry.speed);
            windDirections = weatherData.map(entry => getWindDirection(entry.wind_deg));
            weatherConditions = weatherData.map(entry => entry.weather[0].main);
            humidities = weatherData.map(entry => entry.humidity); // Humidity in percentage
            rainData = weatherData.map(entry => entry.rain || 0); // Rain in mm, default to 0 if not available

            const drawIconsPlugin = {
                id: 'drawIconsPlugin',
                afterDatasetsDraw(chart) {
                    const { ctx, data } = chart;
                    const datasets = data.datasets;

                    data.labels.forEach((label, index) => {
                        const x = chart.scales.x.getPixelForValue(label);

                        const yMax = chart.scales.y.getPixelForValue(datasets[1].data[index]);
                        const yMin = chart.scales.y.getPixelForValue(datasets[2].data[index]);

                        const icon = loadedIcons[weatherConditions[index]];
                        if (icon) {
                            ctx.drawImage(icon, x - 12, yMax - 24, 24, 24);
                            ctx.drawImage(icon, x - 12, yMin - 24, 24, 24);
                        }
                    });
                }
            };

            chart = new Chart(ctx, {
                data: {
                    labels: labels,
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Wind Speed (m/s)',
                            data: windSpeeds,
                            backgroundColor: 'rgba(75, 0, 130, 0.5)',
                            borderColor: 'rgba(75, 0, 130, 1)',
                            yAxisID: 'y1',
                        },
                        {
                            type: 'line',
                            label: 'Max Temperature (°C)',
                            data: maxTemps,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            fill: false,
                            yAxisID: 'y',
                        },
                        {
                            type: 'line',
                            label: 'Min Temperature (°C)',
                            data: minTemps,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            fill: false,
                            yAxisID: 'y',
                        },
                        {
                            type: 'bar',
                            label: 'Humidity (%)',
                            data: humidities,
                            backgroundColor: 'rgba(0, 100, 0, 0.5)',
                            borderColor: 'rgba(0, 100, 0, 1)',
                            yAxisID: 'y2',
                            barThickness: 10, // Decrease bar thickness
                            maxBarThickness: 10 // Ensure maximum bar thickness is also reduced
                        }
                    ]
                },
                options: {
                    scales: {
                        x: {
                            type: 'category',
                            labels: labels,
                            title: {
                                display: true,
                                text: 'Date'
                            },
                            ticks: {
                                callback: function (value, index) {
                                    return labels[index];
                                }
                            }
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Temperature (°C)'
                            },
                            min: 0,
                            max: 56
                        },
                        y1: {
                            type: 'linear',
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Wind Speed (m/s)'
                            },
                            grid: {
                                drawOnChartArea: false
                            },
                            max: 20
                        },
                        y2: {
                            type: 'linear',
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Humidity (%)'
                            },
                            grid: {
                                drawOnChartArea: false
                            },
                            min: 0,
                            max: 100
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = '';
                                    if (context.dataset.type === 'line') {
                                        const rain = rainData[context.dataIndex];
                                        label = `${context.dataset.label}: ${context.raw.toFixed(2)} °C \n Rain: ${rain.toFixed(2)} mm`;
                                    } else if (context.dataset.type === 'bar') {
                                        if (context.dataset.label.includes('Wind Speed')) {
                                            const windSpeed = context.raw.toFixed(2);
                                            const windDirection = windDirections[context.dataIndex];
                                            label = `${context.dataset.label}: ${windSpeed} m/s in ${windDirection} direction`;
                                        } else if (context.dataset.label.includes('Humidity')) {
                                            label = `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
                                        }
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                },
                plugins: [drawIconsPlugin]
            });

            document.getElementById('chart-overlay').style.display = 'block';
            document.getElementById('chart-container').style.display = 'block';
            document.getElementById('chart-overlay').style.zIndex = '100000';
            document.getElementById('chart-container').style.zIndex = '100000';
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
});

document.getElementById('cross-button-weather').addEventListener('click', function () {
    document.getElementById('chart-overlay').style.display = 'none';
    document.getElementById('chart-container').style.display = 'none';
});