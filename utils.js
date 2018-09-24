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

/**
 * Calculates whether a circle with passed position and radius is inside
 * a rectangle with passed position and dimensions (where the origin of
 * the rectangle is the top-left point)
 *
 * @param px Point x
 * @param py Point y
 * @param r Radius
 * @param x Rectangle x
 * @param y Rectangly y
 * @param w Rectangle width
 * @param h Rectangle height
 * @returns {boolean}
 */
function circleInsideRect(px, py, r, x, y, w, h) {
    let inside = true;
    inside &= px + r > x;
    inside &= px - r < x + w;
    inside &= py + r > y;
    inside &= py - r < y + h;
    return inside;
}

export { clamp, quadratic, colour, circleInsideRect };