import { findLeftContext, findRightContext, stripLeftContext, stripRightContext } from '../../Utils/stringutils.js';
import { insertText, replaceText, refreshText } from '../TextEditor.js'
import { quill } from '../../Services/quill.js'
import { provideSuccessFeedback, provideFailureFeedback } from './feedback.js'

export const handleRedictation = (utterance, workingText) => {
    let rightContext = findRightContext(workingText.text, utterance)
    let leftContext
    let updateParameter
    
    if (rightContext.matchIndex >= 0)   
        leftContext = findLeftContext(workingText.text.substring(0, rightContext.matchIndex-1), utterance)
    else    
        leftContext = findLeftContext(workingText.text, utterance)

    if (leftContext.matchText === utterance || rightContext.matchText === utterance)
        provideFailureFeedback('Nothing to update.')

    else if ( leftContext.matchIndex >= 0 && rightContext.matchIndex >= 0 ) {
        updateParameter = {
            startIndex: workingText.startIndex + leftContext.matchIndex,
            length: rightContext.matchIndex + rightContext.matchText.length - leftContext.matchIndex,
            updateText: utterance
        }

        replaceText( updateParameter )
        .then(refreshText( quill.getText() ))
        
        provideSuccessFeedback('Text Updated', updateParameter)
    }

    else if ( leftContext.matchIndex >= 0 ) {
        let regexNextWordString = `(?<=\\b${leftContext.matchText}\\b)[;,:]*\\s(\\b\\w+\\b)`    // Regex Used:  (?<=\brecovers\b)[;,:]*\s(\b\w+\b)
        let regexNextWord = new RegExp(regexNextWordString, 'gi')

        let match = regexNextWord.exec(workingText.text)

        if (match) {
            updateParameter = {
                startIndex: workingText.startIndex + match.index + (match[0].length - match[1].length),
                length: match[1].length,
                updateText: stripLeftContext(utterance, leftContext.matchText)
            }

            replaceText( updateParameter )
            .then(refreshText( quill.getText() ))
        }

        else {
            updateParameter = {
                startIndex: workingText.startIndex + leftContext.matchIndex + leftContext.matchText.length,
                length: 0,
                updateText: ' ' + stripLeftContext(utterance, leftContext.matchText)
            }
            
            insertText( updateParameter )
            .then(refreshText( quill.getText() ))
        }

        provideSuccessFeedback('Text Updated', updateParameter)
    }

    else if ( rightContext.matchIndex >= 0 ) {
        let regexPrevWordString = `(\\b\\w+\\b)(?=[;,:]*\\s\\b${rightContext.matchText}\\b)`    // Regex Used:  (\b\w+\b)(?=[;,:]*\s\brecovers\b)
        let regexPrevWord = new RegExp(regexPrevWordString, 'gi')

        let match = regexPrevWord.exec(workingText.text)
        
        if (match) {
            updateParameter = {
                startIndex: workingText.startIndex + match.index,
                length: match[0].length,
                updateText: stripRightContext(utterance, rightContext.matchText)
            }

            replaceText( updateParameter )
            .then(refreshText( quill.getText() ))
        }

        else {
            let relativeStartIndex = (/[.?!]\s/g.test(workingText.text.substr(rightContext.matchIndex - 2, 2))) ? rightContext.matchIndex : rightContext.matchIndex - 2
            updateParameter = {
                startIndex: workingText.startIndex + relativeStartIndex,
                length: 0,
                updateText: stripRightContext(utterance, rightContext.matchText)
            }

            insertText( updateParameter )
            .then(refreshText( quill.getText() ))
        }

        provideSuccessFeedback('Text Updated', updateParameter)
    }
}

export const handleRedictationPrioritizedWorkingText = (utterance, workingText) => {
    let rightContext = findRightContext(workingText.text, utterance)
    let leftContext
    let updateParameter

    if (rightContext.matchIndex >= 0)   
        leftContext = findLeftContext(workingText.text.substring(0, rightContext.matchIndex-1), utterance)
    else    
        leftContext = findLeftContext(workingText.text, utterance)

    if (leftContext.matchText === utterance || rightContext.matchText === utterance)
        return false;

    else if ( leftContext.matchIndex >= 0 && rightContext.matchIndex >= 0 ) {
        updateParameter = {
            startIndex: workingText.startIndex + leftContext.matchIndex,
            length: rightContext.matchIndex + rightContext.matchText.length - leftContext.matchIndex,
            updateText: utterance
        }

        replaceText( updateParameter )
        .then(refreshText( quill.getText() ))
        
        provideSuccessFeedback('Text Updated', updateParameter)
        return true;
    }

    else if ( leftContext.matchIndex >= 0 ) {
        let regexNextWordString = `(?<=\\b${leftContext.matchText}\\b)[;,:]*\\s(\\b\\w+\\b)`    // Regex Used:  (?<=\brecovers\b)[;,:]*\s(\b\w+\b)
        let regexNextWord = new RegExp(regexNextWordString, 'gi')

        let match = regexNextWord.exec(workingText.text)

        if (match) {
            updateParameter = {
                startIndex: workingText.startIndex + match.index + (match[0].length - match[1].length),
                length: match[1].length,
                updateText: stripLeftContext(utterance, leftContext.matchText)
            }

            replaceText( updateParameter )
            .then(refreshText( quill.getText() ))
        }

        else {
            updateParameter = {
                startIndex: workingText.startIndex + leftContext.matchIndex + leftContext.matchText.length,
                length: 0,
                updateText: ' ' + stripLeftContext(utterance, leftContext.matchText)
            }
            
            insertText( updateParameter )
            .then(refreshText( quill.getText() ))
        }

        provideSuccessFeedback('Text Updated', updateParameter)
        return true;
    }

    else if ( rightContext.matchIndex >= 0 ) {
        let regexPrevWordString = `(\\b\\w+\\b)(?=[;,:]*\\s\\b${rightContext.matchText}\\b)`    // Regex Used:  (\b\w+\b)(?=[;,:]*\s\brecovers\b)
        let regexPrevWord = new RegExp(regexPrevWordString, 'gi')

        let match = regexPrevWord.exec(workingText.text)
        if (match) {
            updateParameter = {
                startIndex: workingText.startIndex + match.index,
                length: match[0].length,
                updateText: stripRightContext(utterance, rightContext.matchText)
            }

            replaceText( updateParameter )
            .then(refreshText( quill.getText() ))
        }

        else {
            let relativeStartIndex = (/[.?!]\s/g.test(workingText.text.substr(rightContext.matchIndex - 2, 2))) ? rightContext.matchIndex : rightContext.matchIndex - 2
            updateParameter = {
                startIndex: workingText.startIndex + relativeStartIndex,
                length: 0,
                updateText: stripRightContext(utterance, rightContext.matchText)
            }

            insertText( updateParameter )
            .then(refreshText( quill.getText() ))
        }

        provideSuccessFeedback('Text Updated', updateParameter)
        return true;
    }
}