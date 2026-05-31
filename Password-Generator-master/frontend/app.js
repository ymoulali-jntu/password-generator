// Character sets
const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+\\/~?';

// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const generatedPasswordInput = document.getElementById('generated-password');
const lengthSlider = document.getElementById('password-length');
const lengthValue = document.getElementById('length-value');
const checkBtn = document.getElementById('check-btn');
const checkPasswordInput = document.getElementById('check-password-input');
const strengthResult = document.getElementById('strength-result');
const toast = document.getElementById('toast');

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Update length display
lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
});

// Generate password
function generatePassword() {
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    const length = parseInt(lengthSlider.value);

    // Validate at least one option is selected
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        showToast('Please select at least one character type', 'error');
        return;
    }

    // Build character pool
    let pool = '';
    if (includeUppercase) pool += UPPERCASE_LETTERS;
    if (includeLowercase) pool += LOWERCASE_LETTERS;
    if (includeNumbers) pool += NUMBERS;
    if (includeSymbols) pool += SYMBOLS;

    // Generate password
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        password += pool[randomIndex];
    }

    generatedPasswordInput.value = password;
    showToast('Password generated successfully!', 'success');
}

// Copy to clipboard
async function copyToClipboard() {
    const password = generatedPasswordInput.value;
    if (!password) {
        showToast('No password to copy', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(password);
        showToast('Password copied to clipboard!', 'success');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = password;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Password copied to clipboard!', 'success');
    }
}

// Check password strength
function checkPasswordStrength() {
    const password = checkPasswordInput.value;
    
    if (!password) {
        showToast('Please enter a password to check', 'error');
        return;
    }

    const strength = calculatePasswordStrength(password);
    displayStrengthResult(strength);
}

// Calculate password strength (matching Java logic)
function calculatePasswordStrength(password) {
    let score = 0;
    const criteria = {
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        length8: false,
        length16: false
    };

    for (let i = 0; i < password.length; i++) {
        const char = password[i];
        const charCode = char.charCodeAt(0);

        // Uppercase (A-Z: 65-90)
        if (charCode >= 65 && charCode <= 90) {
            criteria.uppercase = true;
        }
        // Lowercase (a-z: 97-122)
        else if (charCode >= 97 && charCode <= 122) {
            criteria.lowercase = true;
        }
        // Numbers (0-9: 48-57)
        else if (charCode >= 48 && charCode <= 57) {
            criteria.numbers = true;
        }
        // Symbols (everything else)
        else {
            criteria.symbols = true;
        }
    }

    if (criteria.uppercase) score++;
    if (criteria.lowercase) score++;
    if (criteria.numbers) score++;
    if (criteria.symbols) score++;
    if (password.length >= 8) {
        score++;
        criteria.length8 = true;
    }
    if (password.length >= 16) {
        score++;
        criteria.length16 = true;
    }

    return { score, criteria };
}

// Display strength result
function displayStrengthResult(strength) {
    strengthResult.classList.remove('hidden');
    
    const strengthBar = document.getElementById('strength-bar');
    const strengthScore = document.getElementById('strength-score');
    
    // Update criteria display
    document.getElementById('criteria-uppercase').classList.toggle('met', strength.criteria.uppercase);
    document.getElementById('criteria-lowercase').classList.toggle('met', strength.criteria.lowercase);
    document.getElementById('criteria-numbers').classList.toggle('met', strength.criteria.numbers);
    document.getElementById('criteria-symbols').classList.toggle('met', strength.criteria.symbols);
    document.getElementById('criteria-length-8').classList.toggle('met', strength.criteria.length8);
    document.getElementById('criteria-length-16').classList.toggle('met', strength.criteria.length16);

    // Determine strength level and message
    let message, strengthClass;
    
    if (strength.score === 6) {
        message = 'This is a very good password :D';
        strengthClass = 'very-strong';
    } else if (strength.score >= 4) {
        message = 'This is a good password :) but you can still do better';
        strengthClass = 'strong';
    } else if (strength.score >= 3) {
        message = 'This is a medium password :/ try making it better';
        strengthClass = 'medium';
    } else {
        message = 'This is a weak password :( definitely find a new one';
        strengthClass = 'weak';
    }

    // Update UI
    strengthBar.className = 'strength-bar ' + strengthClass;
    strengthScore.textContent = message;
    strengthScore.className = strengthClass;
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast ' + type;
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Event listeners
generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyToClipboard);
checkBtn.addEventListener('click', checkPasswordStrength);

// Generate initial password
generatePassword();

// Allow Enter key to generate/check
generatedPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') copyToClipboard();
});

checkPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPasswordStrength();
});
