//
// From: https://www.codehim.com/bootstrap/bootstrap-5-password-strength-meter/
// Password strength normalized to 0-100
//
const passwordInput = document.getElementById('password');
const meterSections = document.querySelectorAll('.meter-section');

passwordInput.addEventListener('input', updateMeter);

function updateMeter(event) {
    const password = event.target.value;
    let strength = calculatePasswordStrength(password);

    // Remove all strength classes
    meterSections.forEach((section) => {
        section.classList.remove('weak', 'medium', 'strong', 'very-strong');
    });

    // Add the appropriate strength class based on the strength value
    if (strength >= 20) {
        meterSections[0].classList.add('weak');
    }
    if (strength >= 40) {
        meterSections[1].classList.add('medium');
    }
    if (strength >= 60) {
        meterSections[2].classList.add('strong');
    }
    if (strength >= 80) {
        meterSections[3].classList.add('very-strong');
    }
}

function calculatePasswordStrength(password) {
    const lengthWeight = 3;
    const uppercaseWeight = 3.75;
    const lowercaseWeight = 3.75;
    const numberWeight = 5.25;
    const symbolWeight = 7.5;

    let strength = 0;

    // Calculate the strength based on the password length
    strength += password.length * lengthWeight;

    // Calculate the strength based on uppercase letters
    if (/[A-Z]/.test(password)) {
        strength += uppercaseWeight;
    }

    // Calculate the strength based on lowercase letters
    if (/[a-z]/.test(password)) {
        strength += lowercaseWeight;
    }

    // Calculate the strength based on numbers
    if (/\d/.test(password)) {
        strength += numberWeight;
    }

    // Calculate the strength based on symbols
    if (/[^A-Za-z0-9]/.test(password)) {
        strength += symbolWeight;
    }

    return strength;
}


$.updatePasswordMeter = function(password,username,target) {
    $.updatePasswordMeter._checkRepetition = function(pLen,str) {
        res = ""
        for ( i=0; i<str.length ; i++ ) {
            repeated=true;
            for (j=0;j < pLen && (j+i+pLen) < str.length;j++)
                repeated=repeated && (str.charAt(j+i)==str.charAt(j+i+pLen));
            if (j<pLen) repeated=false;
            if (repeated) {
                i+=pLen-1;
                repeated=false;
            }
            else {
                res+=str.charAt(i);
            };
        };

        return res;
    };

    var score = 0;
    var r_class = 'weak-password';

    // password < 4
    if (password.length < 4 || password.toLowerCase() == username.toLowerCase()) {
        target.width(score + '%').removeClass("weak-password okay-password good-password strong-password"
            ).addClass(r_class);
        return true;
    }

    // password length
    score += password.length * 4;
    score += ($.updatePasswordMeter._checkRepetition(1, password).length - password.length) * 1;
    score += ($.updatePasswordMeter._checkRepetition(2, password).length - password.length) * 1;
    score += ($.updatePasswordMeter._checkRepetition(3, password).length - password.length) * 1;
    score += ($.updatePasswordMeter._checkRepetition(4, password).length - password.length) * 1;

    // password has 3 numbers
    if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) score += 5;

    // password has 2 symbols
    if (password.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) score += 5;

    // password has Upper and Lower chars
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) score += 10;

    // password has number and chars
    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) score += 15;
    //
    // password has number and symbol
    if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([0-9])/)) score += 15;

    // password has char and symbol
    if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([a-zA-Z])/)) score += 15;

    // password is just a nubers or chars
    if (password.match(/^\w+$/) || password.match(/^\d+$/)) score -= 10;

    // verifing 0 < score < 100
    score = score * 2;
    if (score < 0) score = 0;
    if (score > 100) score = 100;
    if (score > 25) r_class = 'okay-password';
    if (score > 50) r_class = 'good-password';
    if (score > 75) r_class = 'strong-password';
    target.width(score + '%').removeClass("weak-password okay-password good-password strong-password")
        .addClass(r_class);
    return true;
};

function scorePassword(pass) {
    let score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    let letters = new Object();
    for (let i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    const variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    };

    let variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return score;
}
