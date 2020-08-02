class Note extends Component {
  constructor(aName, aGridX, aGridY, aIsTonic, aFrequency) {
    super(aGridX, aGridY)
    this.name = aName
    this.isTonic = aIsTonic
    this.frequency = aFrequency
    this.radius = 15
  }

  display() {
    push()
    if (this.isMouseOver() || this.isBeingMoved) {
      fill(color(204, 255, 153))
    }
    ellipse(this.xPixel, this.yPixel, this.radius * 2)
    fill(color(0))
    textAlign(CENTER, CENTER)
    textSize(this.radius)
    text(translateNoteName(this.name), this.xPixel, this.yPixel)
    pop()
  }

  play() {
    instrument.freq(this.frequency)
    envelope.play()
  }
}

// parsing the note entered by the user in the textBox
// the note has to be translated to english as the Note object
// requires english (note name is translated if needed when displayed)
function parseNoteName(aNoteName) {
  //l_note.toUpperCase()
  let l_note = aNoteName.slice()
  if (useSpecialCaracter) {
    l_note = l_note.replace(/#/g, SHARP)
    l_note = l_note.replace(/b/g, FLAT)
  } else {
    l_note = l_note.replace(/\u266f/g, SHARP)
    l_note = l_note.replace(/\u266d/g, FLAT)
  }
  if (testNoteforRegex(l_note, FR_NOTE_REGEX)) {
    l_note = l_note.toLowerCase()
    return translateNoteName(l_note, ENGLISH)
  } else if (testNoteforRegex(l_note, EN_NOTE_REGEX)) {
    l_note = l_note.toUpperCase()
    return l_note
  } else {
    throw 'invalid note'
  }
}

function testNoteforRegex(aNote, aRegex) {
  let validNote = false
  if (aRegex.test(aNote.slice())) {
    validNote = true
  }
  // altered notes
  else if (
    aRegex.test(aNote.substr(0, unicodeStringLength(aNote) - 1)) &&
    ALTERATION_REGEX.test(aNote.substr(unicodeStringLength(aNote) - 1))
  ) {
    validNote = true
  }
  return validNote
}

// given a note and an interval, return the note that’s the interval above the given note;
// aSemitone is here to specify whether the interval is major, minor.
// (C, 3, 4) => E      (E a third above C, major third = 4 semitones))
// (C, 3, 3) => E flat (E flat a third above C, minor third = 3 semitones))
// (C, 1, 0) => C      (C, unison, 0 semitones)
function findNoteFromInterval(aNote, aInterval, aSemitone) {
  let l_offset = 0
  if (aNote.includes(SHARP)) {
    l_offset = 1
  }
  if (aNote.includes(DOUBLE_SHARP)) {
    l_offset = 2
  }
  if (aNote.includes(FLAT)) {
    l_offset = -1
  }
  if (aNote.includes(DOUBLE_FLAT)) {
    l_offset = -2
  }

  let noteIndex = findNoteIndex(aNote)
  let otherNoteIndex = noteIndex + aInterval - 1
  let otherNote = naturalScale[otherNoteIndex % 7]
  let semitoneOnNaturalNotes = 0
  for (let i = noteIndex; i < otherNoteIndex; i++) {
    semitoneOnNaturalNotes += major[i % 7]
  }
  let totalAlteration = aSemitone - semitoneOnNaturalNotes + l_offset
  switch (totalAlteration) {
    case -2:
      otherNote += DOUBLE_FLAT
      break
    case -1:
      otherNote += FLAT
      break
    case 0:
      break
    case 1:
      otherNote += SHARP
      break
    case 2:
      otherNote += DOUBLE_SHARP
      break
    default:
      throw 'tooManyAlterations'
  }
  return otherNote
}

// find the note index [0, 6] in the naturalScale
function findNoteIndex(aNote) {
  let l_index
  for (l_index = 0; l_index < naturalScale.length; l_index++) {
    if (aNote.includes(naturalScale[l_index])) {
      break
    }
  }
  return l_index
}

function translateNoteName(aNoteName, aDestinationLanguage) {
  // if no language was specified, use the currently used Language
  let l_destinationLanguage
  if (typeof aDestinationLanguage === 'undefined') {
    l_destinationLanguage = usedLanguage
  } else {
    l_destinationLanguage = aDestinationLanguage
  }
  let l_naturalNote
  let l_alteration = aNoteName.substr(unicodeStringLength(aNoteName) - 1)
  if (!ALTERATION_REGEX.test(l_alteration)) {
    l_alteration = ''
    l_naturalNote = aNoteName
  } else {
    l_naturalNote = aNoteName.replace(l_alteration, '')
  }
  if (l_destinationLanguage === FRENCH) {
    if (testNoteforRegex(aNoteName, FR_NOTE_REGEX)) {
      return aNoteName
    } else {
      return FRENCH_LANGUAGE_MAP.get(l_naturalNote) + l_alteration
    }
  }
  // else if (l_destinationLanguage === GERMAN) {
  // }
  else if (l_destinationLanguage === ENGLISH) {
    if (testNoteforRegex(aNoteName, EN_NOTE_REGEX)) {
      // console.log("note name = " + aNoteName);
      return aNoteName
    } else if (testNoteforRegex(aNoteName, FR_NOTE_REGEX)) {
      for (let l_note of FRENCH_LANGUAGE_MAP.keys()) {
        if (FRENCH_LANGUAGE_MAP.get(l_note) === l_naturalNote) {
          return l_note + l_alteration
        }
      }
      // for(let i=0; i<l_englishNotes.length; i++) {
      //     if (l_englishNotes[i] === l_note) {
      //         return l_englishNotes[i];
      //     }
      // }
    }
  }
}
