
function genRandom(max) {
    // const arraySize = Math.round((Math.log2(max) + 1) / 8);
    // const values = window.crypto.getRandomValues(new Uint8Array(arraySize));
    const values = window.crypto.getRandomValues(new Uint8Array(8));
    const value = values.reduce((prev, cur, idx) => { return (prev << 8) + cur; });
    return Math.abs(value) % max;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// Fisher-Yates (aka Knuth) Shuffle.
function shuffle(str) {
    let array = str.split("");
    let index = array.length;

    while (index > 0) {
        let randomIndex = Math.floor(Math.random() * index);
        index--;

        // Swap elements
        [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    }

    return array.join("");
}

function generatePassword(length, options) {
    if (!options) {
        options = {
            useLowercase: true,
            useUppercase: true,
            useDigits: true,
            useSymbols: true,
            useBrackets: true,
        };
    }
    // All symbols: '`~!@#$%^&*()-_=+[{]}\|;:\'",<.>/?'
    const symbols = '`~!@#$%^&*-_=+\|;:\'",./?';
    const brackets = '(){}<>[]';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    let pool = (options.useLowercase ? lowercase : "" )
        + (options.useUppercase ? uppercase : "" )
        + (options.useDigits ? digits : "")
        + (options.useSymbols ? symbols : "")
        + (options.useBrackets ? brackets : "");
    pool = shuffle(pool);

    let password = "";
    if (pool.length) {
        for (var i = 0; i < length; i++) {
            var idx = genRandom(pool.length);
            password += pool[idx];
        }
    }

    return password;
}

function generateBase64Password(length) {
    const base64BufferLength = 4 * length / 3;
    let passBuffer = "";
    while(passBuffer.length < base64BufferLength) {
        const values = window.crypto.getRandomValues(new Uint8Array(32));
        passBuffer += btoa(values);
    }
    const maxIndex = passBuffer.length - length;
    const randValues = window.crypto.getRandomValues(new Uint8Array(2));
    const index = ((randValues[0] << 8) + randValues[1]) % maxIndex;
    return passBuffer.substring(index, index + length);
}

// var generatePassword = function() {
//     window.crypto.getRandomValues(new Uint8Array(32)).reduce(
//         (prev, curr, index) => (
//             !index ? prev : prev.toString(36)
//         ) + (
//             index % 2 ? curr.toString(36).toUpperCase() : curr.toString(36)
//         )
//     ).split('').sort(() => 128 -
//         window.crypto.getRandomValues(new Uint8Array(1))[0]
//     ).join('');
// }

let cryptoApisAvailable = true;
if (!window.crypto || !window.crypto.getRandomValues) {
    console.log("window.crypto.getRandomValues() not available");
    cryptoApisAvailable = false;
}
