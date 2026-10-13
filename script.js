const form = document.getElementById("diagnosticForm");

const greenLED = document.getElementById("greenLED");
const blueLED = document.getElementById("blueLED");
const redLED = document.getElementById("redLED");

const ledMessage = document.getElementById("ledMessage");
const report = document.getElementById("report");
const resetButton = document.getElementById("resetButton");

function turnOffAllLEDs() {
    greenLED.classList.remove("active");
    blueLED.classList.remove("active");
    redLED.classList.remove("active");
}

function activateLED(status) {
    turnOffAllLEDs();

    if (status === "healthy") {
        greenLED.classList.add("active");
    } else if (status === "warning") {
        blueLED.classList.add("active");
    } else if (status === "critical") {
        redLED.classList.add("active");
    }
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return replacements[character];
    });
}

function runDiagnostic(event) {
    event.preventDefault();

    const serialNumber = document.getElementById("serialNumber").value.trim();
    const driveType = document.getElementById("driveType").value;
    const healthInput = document.getElementById("health").value;
    const temperatureInput = document.getElementById("temperature").value;
    const reallocatedInput = document.getElementById("reallocated").value;
    const pendingInput = document.getElementById("pending").value;

    if (!serialNumber || !driveType || healthInput === "" ||
        temperatureInput === "" || reallocatedInput === "" || pendingInput === "") {
        alert("Please complete all diagnostic fields.");
        return;
    }

    const health = Number(healthInput);
    const temperature = Number(temperatureInput);
    const reallocated = Number(reallocatedInput);
    const pending = Number(pendingInput);

    if (!Number.isFinite(health) || !Number.isFinite(temperature) ||
        !Number.isFinite(reallocated) || !Number.isFinite(pending) ||
        health < 0 || health > 100 ||
        temperature < -20 || temperature > 150 ||
        reallocated < 0 || pending < 0 ||
        !Number.isInteger(reallocated) || !Number.isInteger(pending)) {
        alert("Please enter valid diagnostic values.");
        return;
    }

    let status;
    let statusTitle;
    const findings = [];
    const recommendations = [];

    if (health < 50 || pending > 0 || reallocated >= 100) {
        status = "critical";
        statusTitle = "CRITICAL CONDITION";

        if (health < 50) findings.push("The reported drive health is below 50%.");
        if (pending > 0) findings.push("Pending sectors have been reported.");
        if (reallocated >= 100) findings.push("A high reallocated-sector count was entered.");

        recommendations.push("Back up important files immediately if the drive is accessible.");
        recommendations.push("Avoid relying on this drive for important data.");
        recommendations.push("Arrange a professional diagnostic assessment and consider replacement.");
    } else if (health < 90 || temperature >= 55 || reallocated > 0) {
        status = "warning";
        statusTitle = "WARNING: ATTENTION REQUIRED";

        if (health < 90) findings.push("The reported health is below 90%.");
        if (temperature >= 55) findings.push("The entered temperature is elevated.");
        if (reallocated > 0) findings.push("Reallocated sectors have been reported.");

        recommendations.push("Back up important files.");
        recommendations.push("Check the drive's SMART report and temperature.");
        recommendations.push("Monitor for worsening values and unexpected system behaviour.");
    } else if (temperature >= 45) {
        status = "warning";
        statusTitle = "WARNING: TEMPERATURE ELEVATED";

        findings.push("The entered temperature is elevated under this simplified assessment.");
        recommendations.push("Check ventilation, cooling, and the manufacturer's temperature limits.");
        recommendations.push("Monitor the drive's temperature during normal operation.");
    } else {
        status = "healthy";
        statusTitle = "HEALTH INDICATES GOOD CONDITION";

        findings.push("The entered health percentage is at least 90%.");
        findings.push("No pending or reallocated sectors were entered.");
        findings.push("The entered temperature is below 45°C.");

        recommendations.push("Continue monitoring the drive.");
        recommendations.push("Keep regular backups of important files.");
    }

    activateLED(status);

    if (status === "healthy") {
        ledMessage.textContent = "GREEN LED ON: No warning signs were identified in the entered values.";
    } else if (status === "warning") {
        ledMessage.textContent = "BLUE LED ON: Potential issues require attention.";
    } else {
        ledMessage.textContent = "RED LED ON: Critical warning signs detected. Protect your data immediately.";
    }

    const findingsHTML = findings.map(item => `<p>• ${escapeHTML(item)}</p>`).join("");
    const recommendationsHTML = recommendations.map(item => `<p>• ${escapeHTML(item)}</p>`).join("");

    report.innerHTML = `
        <h3 class="status-${status}">${statusTitle}</h3>
        <p><strong>Serial Number:</strong> ${escapeHTML(serialNumber)}</p>
        <p><strong>Drive Type:</strong> ${escapeHTML(driveType)}</p>
        <p><strong>Reported Health:</strong> ${health}%</p>
        <p><strong>Temperature:</strong> ${temperature}°C</p>
        <p><strong>Reallocated Sectors:</strong> ${reallocated}</p>
        <p><strong>Pending Sectors:</strong> ${pending}</p>
        <hr style="margin: 15px 0; border-color: #6551d9;">
        <h3>Diagnostic Findings</h3>
        ${findingsHTML}
        <br>
        <h3>Recommended Actions</h3>
        ${recommendationsHTML}
        <p class="report-note">
            This assessment is based on manually entered values. It does not directly access
            the drive or verify its physical condition. Thresholds are simplified screening
            rules, not a manufacturer-specific diagnosis.
        </p>
    `;
}

form.addEventListener("submit", runDiagnostic);

resetButton.addEventListener("click", function () {
    form.reset();
    turnOffAllLEDs();
    ledMessage.textContent = "Awaiting diagnostic information...";
    report.innerHTML = "<p>Enter the hard drive information and run the diagnostic to generate a report.</p>";
});
