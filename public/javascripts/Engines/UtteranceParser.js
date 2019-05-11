import * as tts from '../Services/tts.js'
import { quill } from '../Services/quill.js'
import * as fuzzy from '../Utils/fuzzymatcher.js'
import { handleCommand } from './EditInstructionHandler/Commanding.js'
import { getIndexOfNextSpace, getSentenceIndices, getSentenceSnippetBetweenIndices } from '../Utils/stringutils.js'
import { handleRedictation } from './EditInstructionHandler/Redictation.js';
import { feedbackOnUserUtterance, feedbackOfWorkingTextOnUserUtterance } from './FeedbackHandler.js';

const MAX_REACTION_TEXT_WINDOW_SIZE = 30 // in chars
const cropSelectionToBargeinIndex = true // either crop or full sentence.

var bargeinIndex;
var workingText;

export const handleUtterance = (utterance) => {
    bargeinIndex = tts.getTTSAbsoluteReadIndex() + tts.getTTSRelativeReadIndex();
    workingText = extractWorkingText(bargeinIndex);
    
    feedbackOfWorkingTextOnUserUtterance(workingText.text)
    parseUtterance(utterance, workingText)
}

export const getBargeinIndex = () => {
    return bargeinIndex || 0
}

export const extractWorkingText = (index) => {
    let sentenceIndices = getSentenceIndices(quill.getText(), index)
    let endIndex = getIndexOfNextSpace(quill.getText(), index);

    let extractedTextSnippet
    if (cropSelectionToBargeinIndex)   
        extractedTextSnippet = getSentenceSnippetBetweenIndices(quill.getText(), {start: sentenceIndices.start, end: endIndex})
    else                                
        extractedTextSnippet = getSentenceSnippetBetweenIndices(quill.getText(), sentenceIndices)

    let workingText = {
        text: extractedTextSnippet,
        startIndex: sentenceIndices.start
    }

    if ( endIndex - sentenceIndices.start < MAX_REACTION_TEXT_WINDOW_SIZE && sentenceIndices.start > 0 ) {
        let prevSentenceIndices = getSentenceIndices(quill.getText(), sentenceIndices.start-2)
        workingText = {
            text: getSentenceSnippetBetweenIndices(quill.getText(), prevSentenceIndices) + ' ' + workingText.text,
            startIndex: prevSentenceIndices.start
        }

    }

    return workingText
}

const parseUtterance = (utterance, workingText) => {
    let [firstWord, ...restOfTheUtterance] = utterance.split(' ')
    let keyword = fuzzy.matchFuzzyForCommand(firstWord, restOfTheUtterance)
    if (keyword) {
        restOfTheUtterance = restOfTheUtterance.join(' ')

        let fuzzyArgument = fuzzy.matchFuzzyForArgument(restOfTheUtterance, workingText.text)
        let passArgument = fuzzyArgument || restOfTheUtterance

        feedbackOnUserUtterance(keyword + ' ' + passArgument)

        handleCommand(keyword, passArgument, workingText)
    } 
    
    else
        handleRedictation(utterance, workingText)
}
