function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

// uses a quadratic function to return a number between 0 & 255 based on passed parameters
function quadratic(x, xMax, a, k) {
    let normalisedX = x / xMax * 2;
    return Math.floor((a * (Math.pow(normalisedX - 1, 2)) + k) * 255);
}

function colour(r, g, b) {
    return `rgb(${r},${g},${b}`;
}

export { clamp, quadratic, colour };