//VARIABLES
const errTopicExists = "Topic already exists";
const errTopicLong = "Topic is too long";
const errNoTopic = "No topic entered";
const errNoNoteTopic = "Please select a topic from the navigation bar first";
const errMicPermDenied = "Allow the use of microphone to record a voice note";
const errPasswordUnmatch = "Passwords do not match";
const errPasswordShort = "Password must be at least 8 characters long";
const bread = document.querySelector('.bread');
const burgers = document.querySelectorAll('.burger');
const burgerMiddle = document.querySelector('.burger-middle');
const navBar = document.querySelector('.nav-bar');
const topicSection = document.querySelector('.topic-section');
const addTopic = document.querySelector('.add-topic');
const topicPopup = document.querySelector('.topic-popup');
const topicPopupText = document.querySelector('.topic-popup__text');
const topicPopupOK = document.querySelector('.popup-btn__ok');
const topicPopupCancel = document.querySelector('.popup-btn__cancel');
const overlay = document.querySelector('.overlay');
const errorSuccess = document.querySelector('.error-success');
const errorSuccessMesg = document.querySelector('.error-success__mesg');
const errorSuccessClose = document.querySelector('.error-success__close');
const addNotes = document.querySelector('.add-notes');
const notesContainer = document.querySelector('.notes-container');
const addTextNotes = document.querySelector('.add-text-notes-container a');
const addVoiceNotes = document.querySelector('.add-voice-notes-container a');
const deleteTopic = document.querySelector('.delete-topics-container a');
const notesForm = document.querySelector('.text-notes-form');
const deleteNote = document.querySelectorAll('.delete-note');
const editNote = document.querySelectorAll('.edit-note');
const audioPlayerContainers = document.querySelectorAll(".audio-player-container");
const accountChangeUsername = document.querySelector('.account-changeusername');
const accountChangePassword = document.querySelector('.account-changepassword');
const changeUsernamePopup = document.querySelector('.changeusername-popup');
const changePasswordPopup = document.querySelector('.changepassword-popup');
const usernamePopupCancel = document.querySelector('.username-popup-btn__cancel');
const usernamePopupText = document.querySelector('.changeusername-popup__text');
const passwordPopupCancel = document.querySelector('.password-popup-btn__cancel');
const passwordPopupText = document.querySelectorAll('.changepassword-popup input');
let mediaRecorder;
let mediaRecorder_chunks = new Array();
let audioURL;

//If there are error messages on reload
if (!errorSuccess.classList.contains('close')) {
	new Array(addNotes, notesContainer, topicPopup, navBar, bread).forEach((element) => {
		element.style.pointerEvents = 'none';
		element.style.userSelect = 'none';
	});
}

//FUNCTIONS
function convTime(seconds) {
	if (isFinite(seconds)) {
		if (seconds < 3600 ) return new Date(seconds * 1000).toISOString().substr(14, 5);
		else return new Date(seconds * 1000).toISOString().substr(11, 8);
	} else return seconds
}

function removeWhitespace(input) {
	if (input === null || input === undefined) return;
	return input.toString().trim();
}

function createTextNoteTopic(noteTopic) {
	let currentNotesTopic = document.querySelector('.notes-topic');

	let topic = document.createElement('p');
	topic.innerText = noteTopic;
	let newNotesTopic = document.createElement('div');
	newNotesTopic.classList.add('notes-topic');
	newNotesTopic.appendChild(topic);

	notesContainer.replaceChild(newNotesTopic, currentNotesTopic);
	bread.click();
}

function createTopic(topicName) {
	let link = document.createElement('a');
	link.setAttribute('href', `/topics/topic/${encodeURIComponent(topicName)}`)
	link.innerText = topicName;

	let div = document.createElement('div');
	div.classList.add('topic');
	div.appendChild(link);

	topicSection.appendChild(div);
	(
		async () => axios.post(
			'/topics/savetopic',
			{ topicName: topicName },
		)
	)();
}

function createErrorSuccess(mesg) {
	errorSuccessMesg.innerText = removeWhitespace(mesg);
	errorSuccessClose.click();
}

function createTextNote() {
	let currentNotesTopic = document.querySelector('.notes-topic p').innerText;
	if (currentNotesTopic === '' || currentNotesTopic === null) {
		createErrorSuccess(errNoNoteTopic);
		return;
	}
	let currentNotesForm = document.querySelector('.text-notes-form');

	let newNotesForm = document.createElement('form');
	newNotesForm.setAttribute('method', 'post');
	newNotesForm.setAttribute('action', window.location.pathname);
	newNotesForm.classList.add('text-notes-form');

	let topicName = document.createElement('input');
	topicName.setAttribute('name', 'topic-name');
	topicName.setAttribute('required', 'true');
	topicName.value = currentNotesTopic;
	topicName.style.display = 'none';

	let entryNameContainer = document.createElement('div');
	entryNameContainer.classList.add('entry-name-container');

	let entryNameLabel = document.createElement('label');
	entryNameLabel.setAttribute('for', 'entry-name');
	entryNameLabel.innerText = "Entry name:";
	entryNameLabel.classList.add('entry-name-label');

	let entryName = document.createElement('input');
	entryName.setAttribute('name', 'entry-name');
	entryName.setAttribute('required', 'true');
	entryName.classList.add('entry-name');

	entryNameContainer.append(entryNameLabel, entryName);

	let textArea = document.createElement('textarea');
	textArea.setAttribute('name', 'text-note-entry');

	let textNotesButtonContainer = document.createElement('div');
	textNotesButtonContainer.classList.add('text-notes-button-container');

	let cancelButton = document.createElement('button');
	cancelButton.classList.add('notes-cancel');
	cancelButton.innerText = "Cancel";

	let submitButton = document.createElement('button');
	submitButton.setAttribute('type', 'submit');
	submitButton.classList.add('notes-save');
	submitButton.innerText = "Save";

	textNotesButtonContainer.append(cancelButton, submitButton);

	newNotesForm.append(topicName, entryNameContainer, textArea, textNotesButtonContainer);

	notesContainer.replaceChild(newNotesForm, currentNotesForm);
	CKEDITOR.replace('text-note-entry');

	window.scroll(newNotesForm.offsetLeft, newNotesForm.offsetTop);

	cancelButton.addEventListener('click', event => {
		event.preventDefault();

		let defaultNotesForm = document.createElement('form');
		defaultNotesForm.setAttribute('method', 'post');
		defaultNotesForm.setAttribute('action', window.location.pathname);
		defaultNotesForm.classList.add('text-notes-form');

		notesContainer.replaceChild(defaultNotesForm, newNotesForm);
	});

	submitButton.addEventListener('click', () => {
		entryName.value = removeWhitespace(entryName.value);
	});
}

async function createVoiceNote() {
	let currentNotesTopic = document.querySelector('.notes-topic p').innerText;
	if (currentNotesTopic === '' || currentNotesTopic === null) {
		createErrorSuccess(errNoNoteTopic);
		return;
	}
	let currentNotesForm = document.querySelector('.voice-notes-form');

	let newNotesForm = document.createElement('form');
	newNotesForm.setAttribute('method', 'post');
	newNotesForm.setAttribute('action', window.location.pathname);
	newNotesForm.classList.add('voice-notes-form');

	let topicName = document.createElement('input');
	topicName.setAttribute('name', 'topic-name');
	topicName.setAttribute('required', 'true');
	topicName.value = currentNotesTopic;
	topicName.style.display = 'none';

	let entryNameContainer = document.createElement('div');
	entryNameContainer.classList.add('entry-name-container');

	let entryNameLabel = document.createElement('label');
	entryNameLabel.setAttribute('for', 'entry-name');
	entryNameLabel.innerText = "Entry name:";
	entryNameLabel.classList.add('entry-name-label');

	let entryName = document.createElement('input');
	entryName.setAttribute('name', 'entry-name');
	entryName.setAttribute('required', 'true');
	entryName.classList.add('entry-name');

	entryNameContainer.append(entryNameLabel, entryName);

	let currentAudioEntryContainer = document.querySelector('.audio-entry-container');
	let newAudioEntryContainer = document.createElement('div');
	newAudioEntryContainer.classList.add('audio-entry-container');

	let recordingContainer = document.createElement('div');
	recordingContainer.classList.add('recording-container');

	let audioRecordButton = document.createElement('button');
	audioRecordButton.classList.add('audio-record-button');
	audioRecordButton.appendChild(document.createElement('div'));

	let recordingInfo = document.createElement('p');
	recordingInfo.classList.add('recording-info');
	recordingInfo.innerText = "Start recording";

	let cancelButton = document.createElement('button');
	cancelButton.classList.add('notes-cancel');
	cancelButton.innerText = "Cancel";

	recordingContainer.append(audioRecordButton, recordingInfo);
	newAudioEntryContainer.append(entryNameContainer, recordingContainer, cancelButton);

	newNotesForm.append(topicName, newAudioEntryContainer);
	notesContainer.replaceChild(newNotesForm, currentNotesForm);

	window.scroll(newNotesForm.offsetLeft, newNotesForm.offsetTop);

	audioRecordButton.addEventListener('click', async event => {
		event.preventDefault();
		audioRecordButton.classList.toggle('recording');
		if (audioRecordButton.classList.contains('recording')) {
			recordingInfo.innerText = "Please wait...";

			try {
				let audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
				recordingInfo.innerText = "Stop recording";

				mediaRecorder = new MediaRecorder(audioStream);
				mediaRecorder.start();
				mediaRecorder.addEventListener('dataavailable', event => {
					mediaRecorder_chunks.push(event.data);
				});

			} catch (err) {
				console.error(err);
				recordingContainer.remove();
				createErrorSuccess(errMicPermDenied);
			}

		}	else {
			mediaRecorder.stop()
			recordingInfo.innerText = "Please wait...";

			setTimeout( () => {
				audioBlob = mediaRecorder_chunks.pop()
				audioURL = window.URL.createObjectURL(audioBlob);

				let audioActionsContainer = document.createElement('div');
				audioActionsContainer.classList.add('audio-actions-container');

				let audioNotesEntry = document.createElement('audio');
				audioNotesEntry.classList.add('audio-notes-entry');
				audioNotesEntry.controls = true;
				audioNotesEntry.src = audioURL;

				let audioActionsBtns = document.createElement('div');
				audioActionsBtns.classList.add('audio-actions__btns');

				let audioBtnDiscard = document.createElement('button');
				audioBtnDiscard.classList.add('audio-btn__discard', 'btn');
				audioBtnDiscard.innerText = "Discard";

				let audioBtnSave = document.createElement('button');
				audioBtnSave.setAttribute('type', 'submit');
				audioBtnSave.classList.add('audio-btn__save', 'btn');
				audioBtnSave.innerText = "Save";

				audioActionsBtns.append(audioBtnDiscard, audioBtnSave);
				audioActionsContainer.append(audioNotesEntry, audioActionsBtns);
				newAudioEntryContainer.replaceChild(audioActionsContainer, recordingContainer);

				audioBtnSave.addEventListener('click', () => {
					entryName.value = removeWhitespace(entryName.value);
				});

				audioBtnDiscard.addEventListener('click', event => {
					event.preventDefault();
					if (audioURL) window.URL.revokeObjectURL(audioURL);
					addVoiceNotes.click();
				});
			}, 350);

			newNotesForm.addEventListener('submit', async event => {
				event.preventDefault();

				let form = new FormData(newNotesForm);
				form.append('voice-note-entry', audioBlob);

				let resp = await axios.post(window.location.pathname, form);
				window.location.reload(true);
			});
		}
	});

	cancelButton.addEventListener('click', event => {
		event.preventDefault();
		if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
		setTimeout(() => mediaRecorder_chunks.length = 0, 500)
		if (audioURL) window.URL.revokeObjectURL(audioURL);

		let defaultNotesForm = document.createElement('form');
		defaultNotesForm.setAttribute('method', 'post');
		defaultNotesForm.setAttribute('action', window.location.pathname);
		defaultNotesForm.classList.add('voice-notes-form');

		notesContainer.replaceChild(defaultNotesForm, newNotesForm);
	});
}

//EVENT LISTENERS
bread.addEventListener('click', () => {
	navBar.classList.toggle('open');
	bread.classList.toggle('open');
	burgers.forEach(burger => burger.classList.toggle('open'));

	if (burgerMiddle.classList.contains('open')) {
		let xLimbOne = document.createElement('div');
		let xLimbTwo = document.createElement('div');
		for (let xLimb of new Array(xLimbOne, xLimbTwo)){
			xLimb.style.height = '0.25em';
			xLimb.style.width = '1.5em';
			xLimb.style.borderRadius = '1px';
			xLimb.style.backgroundColor = 'var(--primary-color)';
			xLimb.style.position = 'absolute';
		}
		burgerMiddle.style.display = 'flex';
		burgerMiddle.style.flexDirection = 'column';
		burgerMiddle.style.alignItems = 'center';
		burgerMiddle.style.justifyContent = 'center';
		burgerMiddle.style.position = 'relative';
		setTimeout(() => {
			burgerMiddle.appendChild(xLimbOne);
			burgerMiddle.appendChild(xLimbTwo);
			xLimbOne.style.transform = 'rotate(45deg)';
			xLimbTwo.style.transform = 'rotate(-45deg)';
		}, 500)
	} else document.querySelectorAll('.burger-middle div').forEach(div => burgerMiddle.removeChild(div));
});

errorSuccessClose.addEventListener('click', () => {
	errorSuccessClose.classList.toggle('close');
	errorSuccess.classList.toggle('close');

	if (!errorSuccess.classList.contains('close')) {
		new Array(changePasswordPopup, addNotes, notesContainer, topicPopup, navBar, bread).forEach((element) => {
			element.style.pointerEvents = 'none';
			element.style.userSelect = 'none';
		});
	} else {
		new Array(changePasswordPopup, addNotes, notesContainer, topicPopup, navBar, bread).forEach((element) => {
			element.style.pointerEvents = 'unset';
			element.style.userSelect = 'auto';
		});
	}
});

addTopic.addEventListener('click', event => {
	event.preventDefault()
	topicPopup.style.transform = 'translate(-50%,-50%) scale(1)';
	overlay.style.display = 'unset';
	bread.style.pointerEvents = 'none';
});

topicPopupText.addEventListener('keypress', event => { if (event.keyCode === 13) topicPopupOK.click() });

topicPopupCancel.addEventListener('click', event => {
	event.preventDefault();
	topicPopupText.value = '';
	topicPopup.style.transform = 'translate(-50%,-50%) scale(0)';
	overlay.style.display = 'none';
	bread.style.pointerEvents = 'unset';
});

topicPopupOK.addEventListener('click', event => {
	event.preventDefault();
	let cleanInput = removeWhitespace(topicPopupText.value);
	topicPopupText.value = '';
	if (cleanInput === '' || cleanInput === null) {
		createErrorSuccess(errNoTopic);
		 return;
	 }
	for (let topic of document.querySelectorAll('.topic a')) {
		if (topic.innerText === cleanInput) {
			createErrorSuccess(errTopicExists);
			return;
		}
	};
	if (cleanInput.length > 26) {
		createErrorSuccess(errTopicLong);
		return;
	}
	createTopic(cleanInput);
	topicPopup.style.transform = 'translate(-50%,-50%) scale(0)';
	overlay.style.display = 'none';
	bread.style.pointerEvents = 'unset';
});

accountChangeUsername.addEventListener('click', event => {
	event.preventDefault();
	changeUsernamePopup.style.transform = 'translate(-50%, -50%) scale(1)';
	overlay.style.display = 'unset';
	bread.style.pointerEvents = 'none';
});

accountChangePassword.addEventListener('click', event => {
	event.preventDefault();
	overlay.style.display = 'unset';
	changePasswordPopup.style.transform = 'translate(-50%, -50%) scale(1)';
	bread.style.pointerEvents = 'none';
});

usernamePopupCancel.addEventListener('click', event => {
	event.preventDefault();
	usernamePopupText.value = '';
	changeUsernamePopup.style.transform = 'translate(-50%,-50%) scale(0)';
	overlay.style.display = 'none';
	bread.style.pointerEvents = 'unset';
});

passwordPopupCancel.addEventListener('click', event => {
	event.preventDefault();
	passwordPopupText.forEach(element => {
		element.value = '';
		element.style.boxShadow = "0 0 3px 2px var(--accent-color)";
	});
	changePasswordPopup.style.transform = 'translate(-50%,-50%) scale(0)';
	overlay.style.display = 'none';
	bread.style.pointerEvents = 'unset';
});

changePasswordPopup.addEventListener('submit', event => {
	let password = passwordPopupText[1];
	let password1 = passwordPopupText[2];

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

addTextNotes.addEventListener('click', event => {
	event.preventDefault();
	createTextNote();
});

addVoiceNotes.addEventListener('click', event => {
	event.preventDefault();
	createVoiceNote();
});

deleteTopic.addEventListener('click', event => {
	event.preventDefault();
	let currentNotesTopic = document.querySelector('.notes-topic p').innerText;
	if (currentNotesTopic === '' || currentNotesTopic === null) {
		createErrorSuccess(errNoNoteTopic);
		return;
	}

	let topics = Array.from(document.querySelectorAll('.topic a'));
	let topic = topics.filter(element => element.innerText === currentNotesTopic).pop();

	axios.post('/topics/deletetopic', { topicName: currentNotesTopic })
	.then(() => {
		topic.remove();
		window.location.replace('/home');
	});
});

if (deleteNote) {
	deleteNote.forEach(element => {
		element.addEventListener('click', event => {
			event.preventDefault();
			let topicName = document.querySelector('.notes-topic p').innerText;
			let entryName;
			for (let element of [...event.currentTarget.parentElement.children]) {
				if (element.classList.contains('note-name')) {
					entryName = element.innerText;
					break;
				}
			}
			(
				async () => axios.post(
					'/notes/deletenote',
					{
						topicName: topicName,
						entryName: entryName
					},
				)
			)();
			event.currentTarget.parentElement.remove()
		});
	});
}

if (editNote) {
	editNote.forEach(element => {
		element.addEventListener('click', event => {
			event.preventDefault();
			let editableEntryName;
			for (let element of [...event.currentTarget.parentElement.children]) {
				if (element.classList.contains('note-name')) {
					editableEntryName = element.innerText;
					break;
				}
			}

			let editableChildren = Array.from(event.currentTarget.parentElement.children);
			editableChildren.splice(0,4);

			let editableData = '';
			editableChildren.forEach(child => {
				editableData += child.innerHTML;
			});

			let currentNotesTopic = document.querySelector('.notes-topic p').innerText;
			let currentNotesForm = document.querySelector('.text-notes-form');

			let newNotesForm = document.createElement('form');
			newNotesForm.setAttribute('method', 'post');
			newNotesForm.setAttribute('action', window.location.pathname);
			newNotesForm.classList.add('text-notes-form');

			let topicName = document.createElement('input');
			topicName.setAttribute('name', 'topic-name');
			topicName.setAttribute('required', 'true');
			topicName.value = currentNotesTopic;
			topicName.style.display = 'none';

			let oldEntryName = document.createElement('input');
			oldEntryName.setAttribute('name', 'old-entry-name');
			oldEntryName.setAttribute('required', 'true');
			oldEntryName.value = editableEntryName;
			oldEntryName.style.display = 'none';

			let entryNameContainer = document.createElement('div');
			entryNameContainer.classList.add('entry-name-container');

			let entryNameLabel = document.createElement('label');
			entryNameLabel.setAttribute('for', 'entry-name');
			entryNameLabel.innerText = "Entry name:";
			entryNameLabel.classList.add('entry-name-label');

			let entryName = document.createElement('input');
			entryName.setAttribute('name', 'entry-name');
			entryName.setAttribute('required', 'true');
			entryName.classList.add('entry-name');
			entryName.value = editableEntryName;

			entryNameContainer.append(entryNameLabel, entryName);

			let textArea = document.createElement('textarea');
			textArea.setAttribute('name', 'text-note-entry');

			let textNotesButtonContainer = document.createElement('div');
			textNotesButtonContainer.classList.add('text-notes-button-container');

			let cancelButton = document.createElement('button');
			cancelButton.classList.add('notes-cancel');
			cancelButton.innerText = "Cancel";

			let submitButton = document.createElement('button');
			submitButton.setAttribute('type', 'submit');
			submitButton.classList.add('notes-save');
			submitButton.innerText = "Save";

			textNotesButtonContainer.append(cancelButton, submitButton);

			newNotesForm.append(topicName, oldEntryName, entryNameContainer, textArea, textNotesButtonContainer);

			notesContainer.replaceChild(newNotesForm, currentNotesForm);
			CKEDITOR.replace('text-note-entry');
			CKEDITOR.instances["text-note-entry"].setData(editableData);

			window.scroll(newNotesForm.offsetLeft, newNotesForm.offsetTop);

			cancelButton.addEventListener('click', event => {
				event.preventDefault();

				let defaultNotesForm = document.createElement('form');
				defaultNotesForm.setAttribute('method', 'post');
				defaultNotesForm.setAttribute('action', window.location.pathname);
				defaultNotesForm.classList.add('text-notes-form');

				notesContainer.replaceChild(defaultNotesForm, newNotesForm);
			});

			submitButton.addEventListener('click', () => {
				entryName.value = removeWhitespace(entryName.value);
			});
		});
	});
}

audioPlayerContainers.forEach(container => {
	let children = [];
	let audioPlayer;
	let audioSeekBar;
	let audioSeek;
	let audioCurrentTime;
	let audioDuration;
	let audioPlayPause;
	let audioStop;

	for (let element of container.children) {
		children.push(element);
		if (element.children.length > 0) {
			for (let child of element.children) {
				children.push(child);
			}
		}
	}

	for (let element of children) {
		switch (element.classList.value) {
			case 'audio__player':
				audioPlayer = element;
				break;
			case 'audio__seek-bar':
				audioSeekBar = element;
				break;
			case 'audio__seek':
				audioSeek = element;
				break;
			case 'current-time':
				audioCurrentTime = element;
				break;
			case 'duration':
				audioDuration = element;
				break;
			case 'audio__play_pause':
				audioPlayPause = element;
				break;
			case 'audio__stop':
				audioStop = element;
				break;
		}
	}

	if (!isFinite(audioDuration)) {
		audioPlayer.currentTime = Math.random() * 10000;
		audioDuration.innerText = convTime(audioPlayer.duration);
	}

	audioPlayPause.addEventListener('click', () => {
		if (audioPlayer.paused) audioPlayer.play();
		else audioPlayer.pause();
	});

	audioStop.addEventListener('click', () => {
		if (!audioPlayer.paused) audioPlayer.pause();
		audioPlayer.currentTime = 0;
	});

	audioPlayer.addEventListener('timeupdate', () => {
		audioCurrentTime.innerText = convTime(audioPlayer.currentTime);
		audioDuration.innerText = convTime(audioPlayer.duration);
		audioSeek.style.width = `${audioPlayer.currentTime/audioPlayer.duration * 100}%`;
	});

	audioSeekBar.addEventListener('click', event => {
		audioPlayer.currentTime  = event.offsetX / audioSeekBar.offsetWidth * audioPlayer.duration;
	});
});
