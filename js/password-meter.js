//
// From: https://www.codehim.com/bootstrap/bootstrap-5-password-strength-meter/
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
    if (strength >= 1) {
        meterSections[0].classList.add('weak');
    }
    if (strength >= 2) {
        meterSections[1].classList.add('medium');
    }
    if (strength >= 3) {
        meterSections[2].classList.add('strong');
    }
    if (strength >= 4) {
        meterSections[3].classList.add('very-strong');
    }
}

function calculatePasswordStrength(password) {
    const lengthWeight = 0.2;
    const uppercaseWeight = 0.25;
    const lowercaseWeight = 0.25;
    const numberWeight = 0.35;
    const symbolWeight = 0.5;

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
