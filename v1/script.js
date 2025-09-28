const AU_IN_KM = 149597870.7;
const LIGHT_YEAR_KM = 9.4607e12;
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_YEAR = SECONDS_IN_DAY * 365.25;
const STANDARD_GRAVITY = 9.80665;
const SPEED_OF_LIGHT = 299792458;
const TON_IN_KG = 1000;
const CHEMICAL_ENERGY_PER_TON = 43e9; // approximate energy from burning 1 metric ton of chemical propellant (J)
const HIROSHIMA_YIELD_J = 6.3e13; // Little Boy
const WORLD_ANNUAL_ENERGY_J = 6.0e20; // global energy consumption per year
const SOLAR_LUMINOSITY_W = 3.828e26; // Sun output in watts

const MASS_OPTIONS = [
    { label: "1 t", tons: 1 },
    { label: "10 t", tons: 10 },
    { label: "100 t", tons: 100 },
    { label: "1,000 t", tons: 1_000 },
    { label: "10,000 t", tons: 10_000 },
    { label: "100,000 t", tons: 100_000 },
    { label: "1,000,000 t", tons: 1_000_000 },
    { label: "10,000,000 t", tons: 10_000_000 },
    { label: "100,000,000 t", tons: 100_000_000 },
    { label: "1,000,000,000 t", tons: 1_000_000_000 },
];

const RAW_TARGETS = [
    { name: "Solar System (Earth)", distanceKm: 0 },
    { name: "Mars Orbit", distanceAu: 1.524 },
    { name: "Jupiter Orbit", distanceAu: 5.203 },
    { name: "Saturn Orbit", distanceAu: 9.537 },
    { name: "Neptune Orbit", distanceAu: 30.07 },
    { name: "Kuiper Belt (45 AU)", distanceAu: 45 },
    { name: "Oort Cloud Inner Edge", distanceAu: 2000 },
    { name: "Proxima Centauri", distanceLy: 4.2465 },
    { name: "Alpha Centauri A", distanceLy: 4.37 },
    { name: "Alpha Centauri B", distanceLy: 4.38 },
    { name: "Barnard's Star", distanceLy: 5.96 },
    { name: "Luhman 16", distanceLy: 6.59 },
    { name: "Wolf 359", distanceLy: 7.86 },
    { name: "Sirius A", distanceLy: 8.6 },
    { name: "Sirius B", distanceLy: 8.61 },
    { name: "Ross 128", distanceLy: 11.0 },
    { name: "Epsilon Eridani", distanceLy: 10.5 },
    { name: "Tau Ceti", distanceLy: 11.9 },
    { name: "TRAPPIST-1", distanceLy: 39.5 },
    { name: "Kepler-186", distanceLy: 561 },
    { name: "Kepler-452", distanceLy: 1400 },
    { name: "Vega", distanceLy: 25.0 },
    { name: "Altair", distanceLy: 16.7 },
    { name: "Deneb", distanceLy: 2616 },
    { name: "Polaris", distanceLy: 433 },
    { name: "Betelgeuse", distanceLy: 642 },
    { name: "Rigel", distanceLy: 863 },
    { name: "VY Canis Majoris", distanceLy: 3840 },
    { name: "Sagittarius A* (Galactic Center)", distanceLy: 26000 },
    { name: "Large Magellanic Cloud", distanceLy: 163000 },
    { name: "Small Magellanic Cloud", distanceLy: 200000 },
    { name: "Triangulum Galaxy (M33)", distanceLy: 2730000 },
    { name: "Andromeda Galaxy (M31)", distanceLy: 2537000 },
    { name: "Messier 81", distanceLy: 12000000 },
    { name: "Messier 82", distanceLy: 11700000 },
    { name: "Sombrero Galaxy (M104)", distanceLy: 29000000 },
    { name: "Messier 87", distanceLy: 53500000 },
    { name: "IC 1101", distanceLy: 1047000000 },
];

const TARGETS = RAW_TARGETS.map((item) => {
    let distanceKm = 0;
    if (typeof item.distanceKm === "number") {
        distanceKm = item.distanceKm;
    } else if (typeof item.distanceLy === "number") {
        distanceKm = item.distanceLy * LIGHT_YEAR_KM;
    } else if (typeof item.distanceAu === "number") {
        distanceKm = item.distanceAu * AU_IN_KM;
    }
    return {
        name: item.name,
        distanceKm,
    };
}).sort((a, b) => a.distanceKm - b.distanceKm);

const TARGET_LOOKUP = new Map(TARGETS.map((target) => [target.name, target]));

const form = document.getElementById("trajectory-form");
const originSelect = document.getElementById("origin");
const destinationSelect = document.getElementById("destination");
const distanceOverrideInput = document.getElementById("distanceOverride");
const accelerationRange = document.getElementById("accelerationRange");
const accelerationDisplay = document.getElementById("accelerationDisplay");
const accelerationManual = document.getElementById("accelerationManual");
const accelerationWarning = document.getElementById("accelerationWarning");
const dryMassRange = document.getElementById("dryMassRange");
const dryMassManual = document.getElementById("dryMassManual");
const massWarning = document.getElementById("massWarning");
const dryMassDisplay = document.getElementById("dryMassDisplay");
const formMessage = document.getElementById("formMessage");

const highlightShipDuration = document.getElementById("highlightShipDuration");
const highlightEarthDuration = document.getElementById("highlightEarthDuration");
const highlightSpeed = document.getElementById("highlightSpeed");
const highlightRapidity = document.getElementById("highlightRapidity");

const detailAcceleration = document.getElementById("detailAcceleration");
const detailHalfShip = document.getElementById("detailHalfShip");
const detailHalfEarth = document.getElementById("detailHalfEarth");
const detailDistance = document.getElementById("detailDistance");
const detailGamma = document.getElementById("detailGamma");
const detailPeakVelocity = document.getElementById("detailPeakVelocity");
const detailRapidityPerLeg = document.getElementById("detailRapidityPerLeg");
const detailTotalMass = document.getElementById("detailTotalMass");
const detailFuelMass = document.getElementById("detailFuelMass");

const fuelEnergyField = document.getElementById("fuelEnergy");
const fuelChemicalField = document.getElementById("fuelChemical");
const fuelHiroshimaField = document.getElementById("fuelHiroshima");
const fuelWorldField = document.getElementById("fuelWorld");
const fuelDysonField = document.getElementById("fuelDyson");

function updateWarning(element, message = "", color = "#f1a355") {
    element.textContent = message || "";
    element.style.color = color;
    if (message) {
        element.classList.toggle('error', color === '#ff7676');
    } else {
        element.classList.remove('error');
    }
}

function setAccelerationWarning(message = "", color = "#f1a355") {
    updateWarning(accelerationWarning, message, color);
}

function setMassWarning(message = "", color = "#f1a355") {
    updateWarning(massWarning, message, color);
}

function showFormMessage(message = "", isError = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle("error", Boolean(isError));
}

function resetResults() {
    highlightShipDuration.textContent = "--";
    highlightEarthDuration.textContent = "--";
    highlightSpeed.textContent = "--";
    highlightRapidity.textContent = "--";
    detailAcceleration.textContent = "--";
    detailHalfShip.textContent = "--";
    detailHalfEarth.textContent = "--";
    detailDistance.textContent = "--";
    detailGamma.textContent = "--";
    detailPeakVelocity.textContent = "--";
    detailRapidityPerLeg.textContent = "--";
    detailTotalMass.textContent = "--";
    detailFuelMass.textContent = "--";
    fuelEnergyField.textContent = "--";
    fuelChemicalField.textContent = "--";
    fuelHiroshimaField.textContent = "--";
    fuelWorldField.textContent = "--";
    fuelDysonField.textContent = "--";
}

function populateTargets() {
    originSelect.innerHTML = "";
    destinationSelect.innerHTML = "";

    TARGETS.forEach((target) => {
        const optionOrigin = document.createElement("option");
        optionOrigin.value = target.name;
        optionOrigin.textContent = target.name;

        const optionDestination = optionOrigin.cloneNode(true);

        originSelect.appendChild(optionOrigin);
        destinationSelect.appendChild(optionDestination);
    });

    originSelect.value = "Solar System (Earth)";
    const defaultDestination = "Proxima Centauri";
    if (TARGET_LOOKUP.has(defaultDestination)) {
        destinationSelect.value = defaultDestination;
    }
}

function formatDurationExtended(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "--";

    if (seconds >= SECONDS_IN_YEAR) {
        const years = seconds / SECONDS_IN_YEAR;
        if (years >= 1e6) {
            return `${(years / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })} million years`;
        }
        if (years >= 1e3) {
            return `${years.toLocaleString(undefined, { maximumFractionDigits: 0 })} years`;
        }
        return `${years.toLocaleString(undefined, { maximumFractionDigits: 2 })} years`;
    }

    if (seconds >= SECONDS_IN_DAY) {
        const days = Math.floor(seconds / SECONDS_IN_DAY);
        const hours = Math.floor((seconds % SECONDS_IN_DAY) / 3600);
        const parts = [];
        if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
        if (hours) parts.push(`${hours} hr${hours === 1 ? "" : "s"}`);
        return parts.join(" ") || `${(seconds / SECONDS_IN_DAY).toLocaleString(undefined, { maximumFractionDigits: 2 })} days`;
    }

    if (seconds >= 3600) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours} hr${hours === 1 ? "" : "s"} ${minutes} min`;
    }

    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes} min ${secs} s`;
    }

    return `${seconds.toLocaleString(undefined, { maximumFractionDigits: seconds < 10 ? 2 : 0 })} s`;
}

function formatDistance(distanceKm) {
    if (!Number.isFinite(distanceKm) || distanceKm <= 0) return "--";

    if (distanceKm >= LIGHT_YEAR_KM) {
        const ly = distanceKm / LIGHT_YEAR_KM;
        let lyText;
        if (ly >= 1e6) {
            lyText = `${(ly / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })} million ly`;
        } else if (ly >= 1e3) {
            lyText = `${(ly / 1e3).toLocaleString(undefined, { maximumFractionDigits: 2 })} thousand ly`;
        } else {
            lyText = `${ly.toLocaleString(undefined, { maximumFractionDigits: 3 })} ly`;
        }
        const kmText = distanceKm.toLocaleString(undefined, { notation: "scientific", maximumFractionDigits: 2 });
        return `${lyText} (${kmText} km)`;
    }

    if (distanceKm >= AU_IN_KM) {
        const au = distanceKm / AU_IN_KM;
        return `${au.toLocaleString(undefined, { maximumFractionDigits: 2 })} AU (${distanceKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km)`;
    }

    return `${distanceKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
}

function formatVelocity(velocityMs) {
    if (!Number.isFinite(velocityMs)) return "--";
    const kmPerSec = velocityMs / 1000;
    return `${kmPerSec.toLocaleString(undefined, { maximumFractionDigits: 2 })} km/s (${velocityMs.toLocaleString(undefined, { maximumFractionDigits: 0 })} m/s)`;
}

function formatRapidityBudget(rapidity, cTimesRapidity) {
    if (!Number.isFinite(rapidity)) return "--";
    const kmPerSec = cTimesRapidity / 1000;
    return `${rapidity.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} A (${kmPerSec.toLocaleString(undefined, { maximumFractionDigits: 2 })} km/s)`;
}

function formatRelativeSpeed(relativeToC, velocityMs) {
    if (!Number.isFinite(relativeToC)) return "--";
    const capped = Math.min(relativeToC, 1 - 1e-12);
    return `${capped.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} c (${(velocityMs / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} km/s)`;
}

function formatHighlightSpeed(relativeToC, velocityMs) {
    if (!Number.isFinite(relativeToC)) return "--";
    const capped = Math.min(relativeToC, 1 - 1e-12);
    if (capped >= 0.999) {
        const kmPerSec = velocityMs / 1000;
        return `0.999... c (${kmPerSec.toLocaleString(undefined, { maximumFractionDigits: 2 })} km/s)`;
    }
    return formatRelativeSpeed(capped, velocityMs);
}

function formatGamma(gamma) {
    if (!Number.isFinite(gamma)) return "--";
    if (gamma >= 1000) {
        return `${gamma.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    if (gamma >= 10) {
        return `${gamma.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
    return `${gamma.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 6 })}`;
}

function formatMass(kg) {
    if (!Number.isFinite(kg) || kg <= 0) return "--";
    const tons = kg / TON_IN_KG;
    let tonsLabel;
    if (tons >= 1e9) {
        tonsLabel = `${(tons / 1e9).toLocaleString(undefined, { maximumFractionDigits: 2 })} billion t`;
    } else if (tons >= 1e6) {
        tonsLabel = `${(tons / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })} million t`;
    } else if (tons >= 1e3) {
        tonsLabel = `${(tons / 1e3).toLocaleString(undefined, { maximumFractionDigits: 2 })} thousand t`;
    } else {
        tonsLabel = `${tons.toLocaleString(undefined, { maximumFractionDigits: 0 })} t`;
    }
    const kgScientific = kg.toLocaleString(undefined, { notation: "scientific", maximumFractionDigits: 2 });
    return `${tonsLabel} (${kgScientific} kg)`;
}

function formatEnergy(energyJ) {
    if (!Number.isFinite(energyJ) || energyJ <= 0) return "--";
    if (energyJ >= 1e21) {
        return `${(energyJ / 1e21).toLocaleString(undefined, { maximumFractionDigits: 2 })} ZJ`;
    }
    if (energyJ >= 1e18) {
        return `${(energyJ / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })} EJ`;
    }
    if (energyJ >= 1e15) {
        return `${(energyJ / 1e15).toLocaleString(undefined, { maximumFractionDigits: 2 })} PJ`;
    }
    if (energyJ >= 1e12) {
        return `${(energyJ / 1e12).toLocaleString(undefined, { maximumFractionDigits: 2 })} TJ`;
    }
    if (energyJ >= 1e9) {
        return `${(energyJ / 1e9).toLocaleString(undefined, { maximumFractionDigits: 2 })} GJ`;
    }
    if (energyJ >= 1e6) {
        return `${(energyJ / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })} MJ`;
    }
    if (energyJ >= 1e3) {
        return `${(energyJ / 1e3).toLocaleString(undefined, { maximumFractionDigits: 2 })} kJ`;
    }
    return `${energyJ.toLocaleString(undefined, { maximumFractionDigits: 2 })} J`;
}

function formatLargeCount(value, unit) {
    if (!Number.isFinite(value) || value <= 0) return "--";
    let scaledValue = value;
    let suffix = "";
    if (value >= 1e9) {
        scaledValue = value / 1e9;
        suffix = " billion";
    } else if (value >= 1e6) {
        scaledValue = value / 1e6;
        suffix = " million";
    } else if (value >= 1e3) {
        scaledValue = value / 1e3;
        suffix = " thousand";
    }
    return `${scaledValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix} ${unit}`;
}

function formatTimeFromSeconds(seconds) {
    return formatDurationExtended(seconds);
}

function resolveDistanceKm(originName, destinationName) {
    if (originName === destinationName) {
        throw new Error("Choose two different targets or use a custom distance.");
    }

    const origin = TARGET_LOOKUP.get(originName);
    const destination = TARGET_LOOKUP.get(destinationName);

    if (!origin || !destination) {
        throw new Error("Selected target is not in the catalog.");
    }

    const distanceKm = Math.abs(destination.distanceKm - origin.distanceKm);
    if (distanceKm <= 0) {
        throw new Error("Distance between selections is zero in this simplified model. Provide a custom distance.");
    }

    return distanceKm;
}

function applyAccelerationVisuals(gValue, outOfRange) {
    let color = "#2ecc71";
    let warningText = "";

    if (gValue > 5) {
        color = "#e74c3c";
        warningText = "Danger: Acceleration in this range is lethal without extreme protective measures.";
    } else if (gValue >= 2.1) {
        color = "#e67e22";
        warningText = "Warning: Prolonged acceleration above 2g is unsafe for most humans.";
    } else if (gValue >= 1.1) {
        color = "#f1c40f";
        warningText = "Caution: Sustained acceleration above 1g requires significant crew conditioning.";
    }

    if (outOfRange) {
        const rangeNote = "Manual value is outside the slider range (0.1g-10g).";
        warningText = warningText ? `${warningText} ${rangeNote}` : rangeNote;
    }

    if (warningText) {
        setAccelerationWarning(warningText, color);
    } else {
        setAccelerationWarning("");
    }

    accelerationRange.style.setProperty("accent-color", color);
}

function renderAcceleration(gValue, acceleration, source = "slider") {
    const minG = parseFloat(accelerationRange.min);
    const maxG = parseFloat(accelerationRange.max);
    const outOfRange = source === "manual" && (gValue < minG || gValue > maxG);

    accelerationDisplay.textContent = `${gValue.toFixed(2)} g (${acceleration.toLocaleString(undefined, { maximumFractionDigits: 2 })} m/s^2)`;
    applyAccelerationVisuals(gValue, outOfRange);
}

function renderDryMass() {
    const manualRaw = dryMassManual.value.trim();
    if (manualRaw) {
        const manualTons = Number(manualRaw);
        if (Number.isFinite(manualTons) && manualTons > 0) {
            const kgValue = manualTons * TON_IN_KG;
            dryMassDisplay.textContent = `${manualTons.toLocaleString(undefined, { maximumFractionDigits: 3 })} t (${kgValue.toLocaleString(undefined, { notation: "scientific", maximumFractionDigits: 2 })} kg)`;
            return;
        }
    }

    const index = Number(dryMassRange.value);
    const option = MASS_OPTIONS[index] ?? MASS_OPTIONS[0];
    const kgValue = option.tons * TON_IN_KG;
    dryMassDisplay.textContent = `${option.label} selected (${kgValue.toLocaleString(undefined, { notation: "scientific", maximumFractionDigits: 2 })} kg)`;
}

function updateAccelerationFromSlider() {
    const gValue = Number(accelerationRange.value);
    const acceleration = gValue * STANDARD_GRAVITY;
    renderAcceleration(gValue, acceleration, "slider");
    computeTrajectory();
}

function updateAccelerationFromManual() {
    const manualRaw = accelerationManual.value.trim();
    if (!manualRaw) {
        updateAccelerationFromSlider();
        return;
    }

    const manualAcceleration = Number(manualRaw);
    if (!Number.isFinite(manualAcceleration) || manualAcceleration <= 0) {
        setAccelerationWarning("Manual acceleration must be a positive number.", "#ff7676");
        accelerationRange.style.setProperty("accent-color", "#ff7676");
        showFormMessage("Manual acceleration must be a positive number.", true);
        resetResults();
        return;
    }

    const manualG = manualAcceleration / STANDARD_GRAVITY;
    const clampedG = Math.min(
        Math.max(manualG, parseFloat(accelerationRange.min)),
        parseFloat(accelerationRange.max)
    );
    accelerationRange.value = clampedG.toFixed(2);
    renderAcceleration(manualG, manualAcceleration, "manual");
    computeTrajectory();
}

function computeTrajectory() {
    const origin = originSelect.value;
    const destination = destinationSelect.value;
    const distanceOverrideRaw = distanceOverrideInput.value.trim();

    renderDryMass();
    setMassWarning("");

    let acceleration;
    const manualRaw = accelerationManual.value.trim();
    if (manualRaw) {
        const manualAcceleration = Number(manualRaw);
        if (!Number.isFinite(manualAcceleration) || manualAcceleration <= 0) {
            resetResults();
            setAccelerationWarning("Manual acceleration must be a positive number.", "#ff7676");
            showFormMessage("Manual acceleration must be a positive number.", true);
            return;
        }
        acceleration = manualAcceleration;
    } else {
        acceleration = Number(accelerationRange.value) * STANDARD_GRAVITY;
    }

    if (!Number.isFinite(acceleration) || acceleration <= 0) {
        resetResults();
        setAccelerationWarning("Acceleration must be a positive number.", "#ff7676");
        showFormMessage("Acceleration must be a positive number.", true);
        return;
    }

    let distanceKm;
    if (distanceOverrideRaw) {
        const override = Number(distanceOverrideRaw);
        if (!Number.isFinite(override) || override <= 0) {
            showFormMessage("Override distance must be a positive number.", true);
            resetResults();
            return;
        }
        distanceKm = override;
    } else {
        try {
            distanceKm = resolveDistanceKm(origin, destination);
        } catch (error) {
            showFormMessage(error.message, true);
            resetResults();
            return;
        }
    }

    if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
        showFormMessage("Unable to determine a valid distance.", true);
        resetResults();
        return;
    }

    const distanceMeters = distanceKm * 1000;
    const halfDistance = distanceMeters / 2;

    const coshArgument = 1 + (acceleration * halfDistance) / (SPEED_OF_LIGHT ** 2);
    if (coshArgument < 1) {
        showFormMessage("Inputs produce an invalid relativistic configuration.", true);
        resetResults();
        return;
    }

    const rapidityHalf = Math.acosh(coshArgument);
    const properTimeHalf = (SPEED_OF_LIGHT / acceleration) * rapidityHalf;
    const earthTimeHalf = (SPEED_OF_LIGHT / acceleration) * Math.sinh(rapidityHalf);
    const peakVelocity = SPEED_OF_LIGHT * Math.tanh(rapidityHalf);
    const gamma = Math.cosh(rapidityHalf);

    const shipTimeTotal = 2 * properTimeHalf;
    const earthTimeTotal = 2 * earthTimeHalf;

    const gValue = acceleration / STANDARD_GRAVITY;
    const relativeToC = peakVelocity / SPEED_OF_LIGHT;
    const safeRelativeToC = Math.min(relativeToC, 1 - 1e-12);
    const relativeCPrecise = Math.floor(safeRelativeToC * 1e12) / 1e12;
    const relativeCFormatted = relativeCPrecise.toFixed(12);

    const rapidityPerLeg = rapidityHalf;
    const rapidityTotal = 2 * rapidityHalf;
    const cTimesRapidityPerLeg = SPEED_OF_LIGHT * rapidityPerLeg;
    const cTimesRapidityTotal = SPEED_OF_LIGHT * rapidityTotal;

    let dryMassKg;
    const manualMassRaw = dryMassManual.value.trim();
    if (manualMassRaw) {
        const manualMassTons = Number(manualMassRaw);
        if (!Number.isFinite(manualMassTons) || manualMassTons <= 0) {
            resetResults();
            setMassWarning("Manual dry mass must be a positive number.", "#ff7676");
            showFormMessage("Manual dry mass must be a positive number.", true);
            return;
        }
        dryMassKg = manualMassTons * TON_IN_KG;
        setMassWarning("");
    } else {
        const dryMassOption = MASS_OPTIONS[Number(dryMassRange.value)] ?? MASS_OPTIONS[0];
        dryMassKg = dryMassOption.tons * TON_IN_KG;
        setMassWarning("");
    }

    const massRatioHalf = Math.exp(rapidityPerLeg);
    const massRatioTotal = Math.exp(rapidityTotal);
    const totalMassKg = dryMassKg * massRatioTotal;
    const fuelMassKg = totalMassKg - dryMassKg;
    const fuelEnergyJ = fuelMassKg * (SPEED_OF_LIGHT ** 2);

    highlightShipDuration.textContent = formatDurationExtended(shipTimeTotal);
    highlightEarthDuration.textContent = formatDurationExtended(earthTimeTotal);
    highlightSpeed.textContent = formatHighlightSpeed(safeRelativeToC, peakVelocity);
    highlightRapidity.textContent = formatRapidityBudget(rapidityTotal, cTimesRapidityTotal);

    detailAcceleration.textContent = `${gValue.toFixed(2)} g (${acceleration.toLocaleString(undefined, { maximumFractionDigits: 2 })} m/s^2)`;
    detailHalfShip.textContent = formatDurationExtended(properTimeHalf);
    detailHalfEarth.textContent = formatDurationExtended(earthTimeHalf);
    detailDistance.textContent = formatDistance(distanceKm);
    detailGamma.textContent = formatGamma(gamma);
    detailPeakVelocity.textContent = `${peakVelocity.toLocaleString(undefined, { maximumFractionDigits: 0 })} m/s (${(peakVelocity / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} km/s, ${relativeCFormatted} c)`;
    detailRapidityPerLeg.textContent = formatRapidityBudget(rapidityPerLeg, cTimesRapidityPerLeg);
    detailTotalMass.textContent = formatMass(totalMassKg);
    detailFuelMass.textContent = formatMass(fuelMassKg);

    fuelEnergyField.textContent = formatEnergy(fuelEnergyJ);
    const chemicalEquivalentTons = fuelEnergyJ / CHEMICAL_ENERGY_PER_TON;
    fuelChemicalField.textContent = formatLargeCount(chemicalEquivalentTons, "tons of chemical propellant");
    const hiroshimaCount = fuelEnergyJ / HIROSHIMA_YIELD_J;
    fuelHiroshimaField.textContent = formatLargeCount(hiroshimaCount, "Hiroshima bombs");
    const worldYears = fuelEnergyJ / WORLD_ANNUAL_ENERGY_J;
    fuelWorldField.textContent = formatLargeCount(worldYears, "years");
    const dysonSeconds = fuelEnergyJ / SOLAR_LUMINOSITY_W;
    fuelDysonField.textContent = formatTimeFromSeconds(dysonSeconds);

    showFormMessage("");
}

function initialize() {
    populateTargets();
    renderDryMass();
    resetResults();
    setAccelerationWarning("");
    setMassWarning("");
    showFormMessage("");
    updateAccelerationFromSlider();
}

initialize();

accelerationRange.addEventListener("input", () => {
    accelerationManual.value = "";
    updateAccelerationFromSlider();
});

accelerationManual.addEventListener("input", updateAccelerationFromManual);
originSelect.addEventListener("change", computeTrajectory);
destinationSelect.addEventListener("change", computeTrajectory);
distanceOverrideInput.addEventListener("input", computeTrajectory);
dryMassRange.addEventListener("input", () => {
    dryMassManual.value = "";
    setMassWarning("");
    renderDryMass();
    computeTrajectory();
});

dryMassManual.addEventListener("input", () => {
    setMassWarning("");
    renderDryMass();
    computeTrajectory();
});

form.addEventListener("submit", (event) => event.preventDefault());
