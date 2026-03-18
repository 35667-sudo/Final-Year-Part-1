
document.getElementById('generatePdf').addEventListener('click', async function () {
    const existingPdfUrl = 'report_sample.pdf';
    const firstImageBase64 = mapImage[0];
    console.log(mapImage)
    // if (!firstImageBase64) {
    //     alert('No map image found.');
    //     return;
    // }

    // Fetch the existing PDF
    const existingPdfBytes = await fetch(existingPdfUrl).then(res => res.arrayBuffer());

    // Load the PDF with pdf-lib
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    // Retrieve farmer's details from localStorage
    const farmerName = localStorage.getItem('farmerName') || 'Unknown';
    const farmerCnic = localStorage.getItem('farmerCnic') || 'Unknown';
    const farmerMobile = localStorage.getItem('farmerMobile') || 'Unknown';

    // Add farmer's details to the second page of the PDF
    const secondPage = pages[1]; // Assuming second page is index 1
    const thirdPage = pages[2]; // Assuming second page is index 1

    const fontSize = 12;
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica); // Use Helvetica as default font
    const pageWidth = secondPage.getWidth();

    // Calculate the text widths
    const nameWidth = font.widthOfTextAtSize(`${farmerName}`, 28);
    const cnicWidth = font.widthOfTextAtSize(`${farmerCnic}`, fontSize);
    const mobileWidth = font.widthOfTextAtSize(`${farmerMobile}`, fontSize);

    // Center the text horizontally
    const nameX = (pageWidth - nameWidth) / 2;
    const cnicX = (pageWidth - cnicWidth) / 2;
    const mobileX = (pageWidth - mobileWidth) / 2;


    secondPage.drawText(`${farmerName}`, {
        x: nameX,
        y: 240,
        size: 28,
        font: font,
    });
    secondPage.drawText(`${farmerCnic}`, {
        x: cnicX,
        y: 195,
        size: fontSize,
        font: font,
    });
    secondPage.drawText(`${farmerMobile}`, {
        x: mobileX,
        y: 130,
        size: fontSize,
        font: font,
    });
    console.log(chartImage.length)
    console.log(chartImage)

    if (chartImage.length > 0) {
        console.log(chartImage)
        const chartImageBase64 = chartImage[0]; // Assuming the image is the first element in the array
        const chartImageBytes = await fetch(chartImageBase64).then(res => res.arrayBuffer());
        const pdfChartImage = await pdfDoc.embedPng(chartImageBytes);

        // Define the custom position and size for the chart image
        const imageX = 10; // Custom X position
        const imageY = 80; // Custom Y position
        const imageWidth = 580; // Custom width
        const imageHeight = 500; // Custom height

        thirdPage.drawImage(pdfChartImage, {
            x: imageX,
            y: imageY,
            width: imageWidth,
            height: imageHeight,
        });
    }
    // Define a mapping of IDs to their positions and dimensions
    const imageProperties = {
        11: { page: 1, x: 60, y: 490, width: 470, height: 230 },
        12: { page: 3, x: 50, y: 480, width: 230, height: 140 },
        13: { page: 4, x: 50, y: 480, width: 230, height: 140 },
        14: { page: 5, x: 50, y: 480, width: 230, height: 140 },
        15: { page: 6, x: 50, y: 480, width: 230, height: 140 },
        16: { page: 7, x: 50, y: 480, width: 230, height: 140 },
        17: { page: 1, x: 0, y: 0, width: 0, height: 0 },
        18: { page: 3, x: 310, y: 480, width: 230, height: 140 },
        19: { page: 4, x: 310, y: 480, width: 230, height: 140 },
        20: { page: 5, x: 310, y: 480, width: 230, height: 140 },
        21: { page: 6, x: 310, y: 480, width: 230, height: 140 },
        22: { page: 7, x: 310, y: 480, width: 230, height: 140 },
        // Add more mappings as needed
    };
    const borderRadius = 20; // Border radius for the merged image

    // Define the area positions for each id
    const areaPositions = {
        11: [
            { page: 1, x: 0, y: 0 },
            { page: 1, x: 0, y: 0 },
            { page: 1, x: 0, y: 0 },
            { page: 1, x: 0, y: 0 },
        ],
        12: [
            { page: 3, x: 480, y: 330 },
            { page: 3, x: 480, y: 242 },
            { page: 3, x: 480, y: 160 },
            { page: 3, x: 480, y: 78 },
        ],
        13: [
            { page: 4, x: 480, y: 320 },
            { page: 4, x: 480, y: 232 },
            { page: 4, x: 480, y: 150 },
            { page: 4, x: 480, y: 68 },
        ],
        14: [
            { page: 5, x: 480, y: 320 },
            { page: 5, x: 480, y: 232 },
            { page: 5, x: 480, y: 150 },
            { page: 5, x: 480, y: 68 },
        ],
        15: [
            { page: 6, x: 480, y: 320 },
            { page: 6, x: 480, y: 232 },
            { page: 6, x: 480, y: 150 },
            { page: 6, x: 480, y: 68 },
        ],
        16: [
            { page: 7, x: 480, y: 320 },
            { page: 7, x: 480, y: 232 },
            { page: 7, x: 480, y: 150 },
            { page: 7, x: 480, y: 68 },
        ],
        // Add more mappings as needed
    };

    const polygonArea = localStorage.getItem('NewFarmAreaAcres') || '0'; // Get polygonArea from localStorage

    const areasPositions = [
        { page: 1, x: 280, y: 300 }, // On the first page
        { page: 3, x: 280, y: 395 },
        { page: 4, x: 280, y: 395 }, // On the third page
        { page: 5, x: 280, y: 395 }, // On the third page
        // On the fourth page
        { page: 6, x: 280, y: 395 }, // On the sixth page
        { page: 7, x: 280, y: 395 }, // On the sixth page
    ];

    // Draw the polygonArea value on the specified pages
    areasPositions.forEach((position) => {
        const { page: pageIndex, x, y } = position;

        // Ensure the target page exists
        while (pdfDoc.getPages().length <= pageIndex) {
            pdfDoc.addPage();
        }

        const page = pdfDoc.getPages()[pageIndex];
        page.drawText(`${parseFloat(polygonArea).toFixed(2)}`, { // Format to 2 decimal places
            x: x,
            y: y,
            size: fontSize,
            font: font,
        });
    });
    // Draw zoning area details
    zoningArea.areas.forEach((areaData) => {
        const { id, area } = areaData;
        const positions = areaPositions[id] || [];

        area.forEach((area, i) => {

            const { page: pageIndex, x, y } = positions[i] || { page: 0, x: 50, y: 400 };

            // Ensure the target page exists
            while (pdfDoc.getPages().length <= pageIndex) {
                pdfDoc.addPage();
            }
            const page = pdfDoc.getPages()[pageIndex];

            // Draw each value from the clusterArea on the PDF
            page.drawText(`${area.toFixed(2)}`, {
                x: x,
                y: y, // Adjust y-position for each clusterArea
                size: 14,
                font: font,
            });
            console.log(i, area)
        });
    });
    for (let index = 0; index < imageUrls.polygons.length; index++) {
        const polygon = imageUrls.polygons[index];
        const secondImageBase64 = polygon.url;
        const id = polygon.id;

        // if (!secondImageBase64) {
        //     console.error(`No image found for polygon at index ${index}`);
        //     continue;
        // }

        const firstImg = new Image();
        const secondImg = new Image();

        await new Promise((resolve) => {
            firstImg.onload = () => {
                secondImg.onload = async () => {
                    const firstImgWidth = firstImg.width;
                    const firstImgHeight = firstImg.height;

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = firstImgWidth;
                    canvas.height = firstImgHeight;

                    // Draw the first image
                    ctx.drawImage(firstImg, 0, 0, firstImgWidth, firstImgHeight);

                    // Draw the second image
                    ctx.drawImage(secondImg, 0, 0, firstImgWidth, firstImgHeight);

                    // Apply border radius by creating a clipping path
                    ctx.globalCompositeOperation = 'destination-in';
                    ctx.beginPath();
                    ctx.moveTo(borderRadius, 0);
                    ctx.arcTo(firstImgWidth, 0, firstImgWidth, firstImgHeight, borderRadius);
                    ctx.arcTo(firstImgWidth, firstImgHeight, 0, firstImgHeight, borderRadius);
                    ctx.arcTo(0, firstImgHeight, 0, 0, borderRadius);
                    ctx.arcTo(0, 0, firstImgWidth, 0, borderRadius);
                    ctx.closePath();
                    ctx.clip();

                    // Redraw the images to apply clipping
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.drawImage(firstImg, 0, 0, firstImgWidth, firstImgHeight);
                    ctx.drawImage(secondImg, 0, 0, firstImgWidth, firstImgHeight);

                    const mergedImageBase64 = canvas.toDataURL('image/png');
                    const mergedImageBytes = await fetch(mergedImageBase64).then(res => res.arrayBuffer());

                    // Create an image object from the merged image bytes
                    const pdfImage = await pdfDoc.embedPng(mergedImageBytes);

                    // Get the position and dimensions for the current ID
                    const { page: pageIndex, x, y, width: imgWidth, height: imgHeight } = imageProperties[id] || { page: index + 1, x: 0, y: 0, width: 100, height: 100 };

                    // Ensure the target page exists
                    while (pdfDoc.getPages().length <= pageIndex) {
                        pdfDoc.addPage();
                    }

                    const page = pdfDoc.getPages()[pageIndex];
                    page.drawImage(pdfImage, {
                        x,
                        y,
                        width: imgWidth,
                        height: imgHeight,
                    });

                    resolve();
                };
                secondImg.src = secondImageBase64; // Ensure this is set after onload
            };
            firstImg.src = firstImageBase64; // Ensure this is set after onload
        });
    }
    // Serialize the PDF document to bytes
    const pdfBytes = await pdfDoc.save();

    // Download the modified PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_report_modified.pdf';
    link.click();
});

function mapImages() {
    console.log(mapImage)
}

let mapImage = []

function expandBoundingBox(boundingBox, expansionFactor) {
    // Create a LatLngBounds object
    const latLngBounds = L.latLngBounds(boundingBox);

    // Get the center of the bounding box
    const center = latLngBounds.getCenter();

    // Calculate the distances from the center to the corners
    const sw = latLngBounds.getSouthWest();
    const ne = latLngBounds.getNorthEast();
    const latDistance = ne.lat - sw.lat;
    const lngDistance = ne.lng - sw.lng;

    // Expand distances by the factor (e.g., 1.5 for 50% expansion)
    const expandedLatDistance = latDistance * expansionFactor;
    const expandedLngDistance = lngDistance * expansionFactor;

    // Create new bounds with expanded distances
    const newSw = L.latLng(center.lat - expandedLatDistance / 1.5, center.lng - expandedLngDistance / 1.5);
    const newNe = L.latLng(center.lat + expandedLatDistance / 1.5, center.lng + expandedLngDistance / 1.5);

    return L.latLngBounds(newSw, newNe);
}

function downloadMapImage(boundingBox) {
    // Expand the bounding box by 50%
    const expandedBounds = expandBoundingBox(boundingBox, 1.5);
    const latLngBounds = L.latLngBounds(expandedBounds);
    map.fitBounds(latLngBounds);
    const generatePdfButton = document.getElementById('generatePdf');

    // Ensure map is fully rendered
    map.once('moveend', function () {
        // Wait for all map tiles to load
        leafletImage(map, function (err, canvas) {
            if (err) {
                console.error('Error generating map image:', err);
                return;
            }

            // Get the pixel coordinates of the expanded bounding box
            const nw = map.latLngToContainerPoint(latLngBounds.getNorthWest());
            const se = map.latLngToContainerPoint(latLngBounds.getSouthEast());

            // Calculate the dimensions of the expanded bounding box
            const width = se.x - nw.x;
            const height = se.y - nw.y;

            // Create a new canvas with the expanded bounding box dimensions
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = width;
            croppedCanvas.height = height;
            const ctx = croppedCanvas.getContext('2d');

            // Draw the cropped image
            ctx.drawImage(canvas, nw.x, nw.y, width, height, 0, 0, width, height);

            // Convert the cropped canvas to a data URL
            const imageDataURL = croppedCanvas.toDataURL('image/png');

            // Trigger a download of the cropped image
           // const link = document.createElement('a');
           // link.href = imageDataURL;
           // link.download = 'map.png';
           // document.body.appendChild(link);
           // link.click();
           // document.body.removeChild(link);

            try {
                mapImage.push(imageDataURL);

            } catch (e) {
                console.error('Error saving map image to session storage:', e);
            }
            function checkConditions() {
                const button = document.getElementById('generatePdf');

                if (imageUrls.length === 12 && zoningArea.areas.length === 6) {
                    button.disabled = false;
                } else {
                    button.disabled = true;
                }
            }


        });
    });
}

let chartImage = []
let hasLoadedWeatherChart = false;

function loadWeatherChart() {
    console.log(hasLoadedWeatherChart)

    if (!hasLoadedWeatherChart) {
        hasLoadedWeatherChart = true;
        console.log(hasLoadedWeatherChart)
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
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&units=metric&cnt=16&appid=${apiKey}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const weatherData = data.list;
                if (!weatherData || !Array.isArray(weatherData) || weatherData.length === 0) {
                    throw new Error('No weather data available');
                }
                console.log(weatherData);

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
                    img.crossOrigin = "anonymous"; // Add this line

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
                const downloadChartAsPNG = () => {
                    const a = document.createElement('a');
                    a.href = chart.toBase64Image();
                    a.download = 'weatherChart.png';
                    a.click();
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
                                label: 'Max Temperature (Â°C)',
                                data: maxTemps,
                                borderColor: 'rgba(255, 99, 132, 1)',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                fill: false,
                                yAxisID: 'y',
                            },
                            {
                                type: 'line',
                                label: 'Min Temperature (Â°C)',
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
                        animation: {
                            onComplete: function () {

                                const a = document.createElement('a');

                                const base64Image = chart.toBase64Image();

                                if (base64Image) {
                                    // console.log(base64Image);
                                    
                                    // Check if the image is already in the array
                                    if (!chartImage.includes(base64Image)) {
                                        chartImage.push(base64Image);
                                        console.log("Image appended to the list.");
                                    } else {
                                        console.log("Image already exists in the list.");
                                    }
                            
                                    a.href = base64Image;
                                    // a.download = 'my_file_name.png';

                                    // document.body.appendChild(a);

                                    // a.click();
                                    // document.body.removeChild(a);
                                } else {
                                    console.error('Base64 image could not be created.');
                                }
                            },
                        },
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
                                    text: 'Temperature (Â°C)'
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
                            },

                        },

                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        let label = '';
                                        if (context.dataset.type === 'line') {
                                            const rain = rainData[context.dataIndex];
                                            label = `${context.dataset.label}: ${context.raw.toFixed(2)} Â°C \n Rain: ${rain.toFixed(2)} mm`;
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
                document.getElementById('chart-overlay').style.zIndex = '0';
                document.getElementById('chart-container').style.zIndex = '0';
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }
}

document.getElementById('cross-button-weather').addEventListener('click', function () {
    document.getElementById('chart-overlay').style.display = 'none';
    document.getElementById('chart-container').style.display = 'none';
});


/////////////////////////////////////


