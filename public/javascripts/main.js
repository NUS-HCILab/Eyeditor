import { data } from './Data/data.js'
import * as tts from './Services/tts.js'
import { recognition } from './Services/speechrecognizer.js';
import * as editor from './Engines/TextEditor.js'
import { generateFuzzySetForCommands } from './Utils/fuzzymatcher.js';
import { quill } from './Services/quill.js'
import { setFeedbackConfigVariable } from './Drivers/RingControllerDriver.js';
import { startTaskTimer, pauseTaskTimer } from './Services/tasktimer.js';
import { getSocket } from './Services/socket.js';
import uuid from './Services/uuid.js'
import { logFinalText } from './Utils/UserDataLogger.js';

var feedbackConfiguration = 'DEFAULT';
var loadedText;
var pushToBladeLock = false;    // if true => locked => push to blade.

let socket = getSocket();

export const getFeedbackConfiguration = () => feedbackConfiguration
export const getLoadedText = () => loadedText
export const getPushToBladeLockStatus = () => pushToBladeLock

/* configure TTS */
tts.setup()

/* create the fuzzy set for command keywords */
generateFuzzySetForCommands()

const initLoad = (text) => {
    mic.checked = false
    editor.refreshText(text, true)
    loadedText = quill.getText()
    tts.setTTSReadStartedFlag(false)
    allocateLogFile();
}

const initMode = (data, config) => {
    feedbackConfiguration = config
    setFeedbackConfigVariable(config)
    initLoad(data.textToCorrect)
}

const initRead = (data, config) => {
    feedbackConfiguration = config
    initLoad(data)
}

/* Task Button Handlers */
btn_c1.addEventListener('click', (e) => { initMode(data.task[0], 'DISP_ON_DEMAND') })
btn_c2.addEventListener('click', (e) => { initMode(data.task[1], 'DISP_ON_DEMAND') })
btn_c3.addEventListener('click', (e) => { initMode(data.task[2], 'DISP_ALWAYS_ON') })
btn_c4.addEventListener('click', (e) => { initMode(data.task[2], 'AOD_SCROLL') })
btn_c5.addEventListener('click', (e) => { initMode(data.task[2], 'EYES_FREE') })
btn_c6.addEventListener('click', (e) => { initMode(data.training[0], 'ODD_FLEXI') })

btn_tr1.addEventListener('click', (e) => { initMode(data.training[0], 'DISP_ON_DEMAND') })
btn_tr2.addEventListener('click', (e) => { initMode(data.training[1], 'DISP_ALWAYS_ON') })

btn_test.addEventListener('click', (e) => { initMode(data.training[1], 'DEFAULT') })
btn_read.addEventListener('click', (e) => { initRead(data.reading[0], 'DISP_ALWAYS_ON') })

btn_t1.addEventListener('click', (e) => { initMode(data.training[0], 'AOD_SCROLL') })

mic.addEventListener('click', (e) => {
    if (mic.checked) {
        recognition.start();
        startTaskTimer();
    }
    else {
        recognition.stop();
        logFinalText();
        pauseTaskTimer();
        socket.emit('patch-file');
    }
})

if (!pushToBladeLock)
    $(".lock").toggleClass('unlocked');

$(".lock").click(function () {
    $(this).toggleClass('unlocked');
    pushToBladeLock = !pushToBladeLock
});

const allocateLogFile = () => {
    const logfileBase = `user_${uuid()}.csv`
    socket.emit('createlog', logfileBase)
}