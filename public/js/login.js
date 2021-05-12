// SELECTORS
const errPasswordShort = "Password must be at least 8 characters long";
const errorSuccess = document.querySelector('.error-success');
const errorSuccessMesg = document.querySelector('.error-success__mesg');
const errorSuccessClose = document.querySelector('.error-success__close');
const loginForm = document.querySelector('.login-form');
const email = document.querySelector('.email-container input');
const password = document.querySelector('.password-container input');

//If there are error messages on reload
if (!errorSuccess.classList.contains('close')) {
	loginForm.style.pointerEvents = 'none';
	loginForm.style.userSelect = 'none';
}

// FUNCTIONS
function removeWhitespace(input) {
	if (input === null || input === undefined) return;
	return input.toString().trim();
}

function createErrorSuccess(mesg) {
	errorSuccessMesg.innerText = removeWhitespace(mesg);
	errorSuccessClose.click();
}

// EVENT HANDLERS
loginForm.addEventListener('submit', (event) => {
	email.value = removeWhitespace(email.value);
	if (password.value.length < 8) {
		password.style.boxShadow = "0 0 8px 3px red";
    createErrorSuccess(errPasswordShort);
		event.preventDefault();
  }
});

errorSuccessClose.addEventListener('click', () => {
	errorSuccessClose.classList.toggle('close');
	errorSuccess.classList.toggle('close');

	if (!errorSuccess.classList.contains('close')) {
		loginForm.style.pointerEvents = 'none';
		loginForm.style.userSelect = 'none';
	}
	else {
    loginForm.style.pointerEvents = 'unset';
		loginForm.style.userSelect = 'auto';
	}
});
