let globalOpacity = 1.0;
console.log(window.climateLayer,"dmsm ss")

// Apply opacity to both WMS and Zone (if they exist)
function applyOpacity() {
  if (currentWMSLayer) {
    currentWMSLayer.setOpacity(globalOpacity);
    console.log("WMS opacity:", globalOpacity);
  }
  if (window.currentRasterLayer) {
    window.currentRasterLayer.setOpacity(globalOpacity);
    console.log("WMS opacity:", globalOpacity);
  }
   if (window.lulcLayer) {
    window.lulcLayer.setOpacity(globalOpacity);
    console.log("WMS opacity:", globalOpacity);
  }

  if (window.zoneLayer) {
    window.zoneLayer.setStyle({ fillOpacity: globalOpacity });
    console.log("Zone opacity:", globalOpacity);
  }
    if (window.climateLayer) {
    window.climateLayer.setOpacity(globalOpacity);
    console.log("Climate opacity:", globalOpacity);
  }
  // Sync slider + label
  document.getElementById("opacitySlider").value = globalOpacity;
  document.getElementById("opacityValue").innerText = globalOpacity.toFixed(1);
}

// Change opacity with + / - buttons
function changeOpacity(increase = true) {
  let newOpacity = increase
    ? Math.min(1, globalOpacity + 0.1)
    : Math.max(0, globalOpacity - 0.1);

  globalOpacity = newOpacity;
  applyOpacity();
}

// Slider control
document.getElementById("opacitySlider").addEventListener("input", function () {
  globalOpacity = parseFloat(this.value);
  applyOpacity();
});

// Initialize UI with default opacity
applyOpacity();
