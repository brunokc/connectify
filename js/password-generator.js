
function genRandom(max) {
    const arraySize = Math.round((Math.log2(max) + 1) / 8);
    const values = window.crypto.getRandomValues(new Uint8Array(arraySize));
    const value = values.reduce((prev, curr, idx) => { return prev * 8 + curr; });
    return value % max;
}

function shuffle(array) {
    let newArray = Array(array.length);
    i = array.length;
    while(i--) newArray[i] = array[i];

    for (var i = 0; i < newArray.length; i++) {
        var idx = genRandom(newArray.length);
        const tmp = newArray[idx];
        newArray[idx] = newArray[i];
        newArray[i] = tmp;
    }
    return newArray;
}

function generatePassword(length) {
    const specials = '!@#$%^&*()_+{}:"<>?|[];\',./`~';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const all = shuffle(specials + lowercase + uppercase + numbers);

    const picks = genRandom(length);
    let password = "";
    for (var i = 0; i < picks; i++) {
        var idx = genRandom(all.length);
        password += all[idx];
    }

    return password;
}

function generateBase64Password(length) {
    const values = window.crypto.getRandomValues(new Uint8Array(32));
    const pass = btoa(values);
    const maxIndex = pass.length - length;
    const randValues = window.crypto.getRandomValues(new Uint8Array(2));
    const index = (randValues[0] * 256 + randValues[1]) % maxIndex;
    return pass.substring(index, index + length);
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
