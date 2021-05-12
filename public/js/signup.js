// SELECTORS
const errPasswordUnmatch = "Passwords do not match";
const errPasswordShort = "Password must be at least 8 characters long";
const errorSuccess = document.querySelector('.error-success');
const errorSuccessMesg = document.querySelector('.error-success__mesg');
const errorSuccessClose = document.querySelector('.error-success__close');
const signupForm = document.querySelector('.signup-form');
const username = document.querySelector('.username-container input');
const email = document.querySelector('.email-container input');
const password = document.querySelector('.password-container input');
const password1 = document.querySelector('.password1-container input');

//If there are error messages on reload
if (!errorSuccess.classList.contains('close')) {
	signupForm.style.pointerEvents = 'none';
	signupForm.style.userSelect = 'none';
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

// EVENT LISTENERS
signupForm.addEventListener('submit', event => {
	username.value = removeWhitespace(username.value);
	email.value = removeWhitespace(email.value);

  if (password.value !== password1.value) {
		password.style.boxShadow = "0 0 8px 3px red";
		password1.style.boxShadow = "0 0 8px 3px red";
    createErrorSuccess(errPasswordUnmatch);
		event.preventDefault();
  } else if (password.value.length < 8) {
		password.style.boxShadow = "0 0 8px 3px red";
		password1.style.boxShadow = "0 0 8px 3px red";
    createErrorSuccess(errPasswordShort);
		event.preventDefault();
  }
});

errorSuccessClose.addEventListener('click', () => {
	errorSuccessClose.classList.toggle('close');
	errorSuccess.classList.toggle('close');

	if (!errorSuccess.classList.contains('close')) {
		signupForm.style.pointerEvents = 'none';
		signupForm.style.userSelect = 'none';
	}
	else {
    signupForm.style.pointerEvents = 'unset';
		signupForm.style.userSelect = 'auto';
	}
});
