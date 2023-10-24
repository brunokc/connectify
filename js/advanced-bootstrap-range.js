
function setupRangeForNotches() {
    const range = document.querySelectorAll(".range-with-labels")[0];
    const rangeNotches = document.querySelectorAll(".range-labels")[0];

    if (range && range.tagName && range.tagName !== "INPUT") {
        range = range.getElementsByTagName("input")[0];
    }

    // Add as many notches as necessary
    if (range) {
        const min = parseInt(range.min);
        const max = parseInt(range.max);
        const step = parseInt(range.step);
        for (let i = min; i <= max; i += step) {
            let label = document.createElement("span");
            label.innerText = i;
            rangeNotches.appendChild(label);
        }
    }
};

setupRangeForNotches();
