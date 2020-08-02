'use strict'
//document.addEventListener('contextmenu', event => event.preventDefault());
const FRENCH_LANGUAGE_MAP = new Map([
  ['C', 'do'],
  ['D', 'ré'],
  ['E', 'mi'],
  ['F', 'fa'],
  ['G', 'sol'],
  ['A', 'la'],
  ['B', 'si'],
  ['Major', 'Majeur'],
  ['Harmonic minor', 'Mineur harmonique'],
  ['Ascending melodic minor', 'Mineur mélodique ascendant'],
  ['Descending melodic minor', 'Mineur Mélodique descendant'],
  ['Add scale', 'Ajouter la gamme'],
  ['remove all scales', 'Enlever toutes les gammes'],
  ['Language', 'Langue']
])

const NUMBER_OF_LANGUAGES = 2
const ENGLISH = 0
const FRENCH = 1
// const GERMAN = 2;
let usedLanguage = ENGLISH
const EN_NOTE_REGEX = /^[a-g]$/i
const FR_NOTE_REGEX = /^do$|^re$|^ré$|^mi$|^fa$|^sol$|^la$|^si$/i
const NOTE_REGEX = /^[a-g]$|^do$|^re$|^ré$|^mi$|^fa$|^sol$|^la$|^si$/i

const ALTERATION_REGEX = new RegExp(
  '^\u266f$|^#$|^\u266d$|^b$|^\u{1d12a}$|^##$|^\u{1d12b}$|^bb$'
)
const useSpecialCaracter = true
const SHARP = useSpecialCaracter ? '\u266f' : '#'
const DOUBLE_SHARP = useSpecialCaracter ? '\u{1d12a}' : '##'
const FLAT = useSpecialCaracter ? '\u266d' : 'b'
const DOUBLE_FLAT = useSpecialCaracter ? '\u{1d12b}' : 'bb'

const A_440 = 440
const TWELFTH_ROOT_OF_TWO = 1.05946309436
const EQUAL_TEMPERAMENT_FREQ = new Map()

let attackLevel = 0.4
let releaseLevel = 0
let attackTime = 0.001
let decayTime = 0.2
let susPercent = 0.2
let releaseTime = 0.5
const envelope = new p5.Env()
envelope.setADSR(attackTime, decayTime, susPercent, releaseTime)
envelope.setRange(attackLevel, releaseLevel)
const instrument = new p5.Oscillator('sine')
instrument.amp(envelope)
instrument.start()

const numberOfSteps = 17
const margin = 50
let interline
let maxNumberOfScales

let shiftIsHeld = false

let scalesArray = []
let canvas

let SCALE_SLIDER
let SCALE_TEXT_INPUT
let MAJOR_MINOR_SELECT

let currentAlterationChoice = ''

function setup() {
  let l_canvasDiv = select('#canvasDiv')
  canvas = createCanvas(800, 600)
  canvas.parent(l_canvasDiv)
  canvas.elt.addEventListener('contextmenu', (event) => event.preventDefault())
  SCALE_SLIDER = select('#scaleSlider')
  SCALE_TEXT_INPUT = select('#scaleTextInput')
  MAJOR_MINOR_SELECT = select('#majorMinorSelect')
  select('#scaleSelection').elt.addEventListener('keydown', function (event) {
    // event.preventDefault();
    if (event.keyCode === 13) {
      createScale()
    }
  })
  interline = (height - 2 * margin) / (numberOfSteps - 1)
  maxNumberOfScales = Math.floor((width - 2 * margin) / margin)
  let l_chromaticScale = []
  for (let i = 0; i < 12; i++) {
    l_chromaticScale[i] = 220 * pow(TWELFTH_ROOT_OF_TWO, i)
    l_chromaticScale[i] = Math.round(l_chromaticScale[i] * 100) / 100
  }
  let l_semitoneOnNaturalNotes = 0
  for (let l_noteIndex = 0; l_noteIndex < naturalScale.length; l_noteIndex++) {
    for (let l_offset = -2; l_offset <= 2; l_offset++) {
      try {
        let l_note = findNoteFromInterval(
          naturalScale[0],
          l_noteIndex + 1,
          l_semitoneOnNaturalNotes + l_offset
        )
        let l_frequencyIndex = (l_semitoneOnNaturalNotes + l_offset + 3) % 12
        EQUAL_TEMPERAMENT_FREQ.set(l_note, l_chromaticScale[l_frequencyIndex])
      } catch (e) {
        console.log(e)
      }
    }
    l_semitoneOnNaturalNotes += major[l_noteIndex]
  }

  // for (let i=0; i<naturalScale.length; i++) {
  //     if (i>=5) {
  //         scalesArray.push(new Scale(naturalScale[i], createMode(naturalScale[i]), scalesArray.length, 1));
  //     }
  //     else {
  //         scalesArray.push(new Scale(naturalScale[i], createMode(naturalScale[i]), scalesArray.length));
  //     }
  // }
}

function draw() {
  push()
  colorMode(HSB)
  background(241, 63, 93)
  noSmooth()
  strokeWeight(1)
  stroke(255)
  for (let i = 0; i < numberOfSteps; i++) {
    line(0, margin + i * interline, width, margin + i * interline)
  }
  pop()
  for (let i = 0; i < scalesArray.length; i++) {
    if (mouseIsPressed) {
      scalesArray[i].pixelMove()
    }
    scalesArray[i].display()
  }
}

function mousePressed() {
  // to move the one that’s being displayed on top of the stack
  for (let i = scalesArray.length - 1; i >= 0; i--) {
    let movedSomething = scalesArray[i].mousePressed()
    if (movedSomething) {
      break
    }
  }
}

function mouseReleased() {
  if (!mouseIsPressed) {
    for (let i = 0; i < scalesArray.length; i++) {
      scalesArray[i].mouseReleased()
    }
  }
}

function keyPressed() {
  switch (keyCode) {
    case SHIFT:
      // console.log("shiftIsHeld = true");
      shiftIsHeld = true
      break
  }
}

function keyReleased() {
  switch (keyCode) {
    case SHIFT:
      // console.log("shiftIsHeld = false");
      shiftIsHeld = false
      break
  }
}

function setScaleName() {
  let l_name = naturalScale[SCALE_SLIDER.value()] + currentAlterationChoice
  l_name = translateNoteName(l_name)
  SCALE_TEXT_INPUT.value(l_name)
}

function setFlat() {
  currentAlterationChoice = FLAT
  setScaleName()
}
function setNatural() {
  currentAlterationChoice = ''
  setScaleName()
}
function setSharp() {
  currentAlterationChoice = SHARP
  setScaleName()
}

function toggleLanguage() {
  usedLanguage++
  usedLanguage %= NUMBER_OF_LANGUAGES
  setScaleName()
}

function createScale() {
  let l_mode
  try {
    let l_note = parseNoteName(SCALE_TEXT_INPUT.value())
    switch (MAJOR_MINOR_SELECT.value()) {
      case 'major':
        l_mode = major
        break
      case 'harmonicMinor':
        l_mode = harmonicMinor
        break
      case 'ascendingMelodicMinor':
        l_mode = ascendingMelodicMinor
        break
      case 'descendingMelodicMinor':
        l_mode = descendingMelodicMinor
        break
      case 'mode':
        l_mode = createMode(l_note)
        break
    }
    scalesArray.push(new Scale(l_note, l_mode, scalesArray.length))
  } catch (e) {
    console.log(e)
  }
}

// can accept either the reference to the scale object or the index of the scale in the array
function deleteScale(aScale) {
  if (typeof aScale === 'object') {
    for (let i = 0; i < scalesArray.length; i++) {
      if (scalesArray[i] === aScale) {
        scalesArray[i].delete()
        scalesArray.splice(i, 1)
      }
    }
  } else if (typeof aScale === 'number') {
    let l_scaleIndex = aScale
    if (l_scaleIndex < scalesArray.length) {
      scalesArray[l_scaleIndex].delete()
      scalesArray.splice(l_scaleIndex, 1)
    }
  }
}

function removeAllScales() {
  for (let i = 0; i < scalesArray.length; i++) {
    scalesArray[i].delete()
  }
  scalesArray.length = 0
}

// function fixedFromCharCode(codePt) {
//     if (codePt > 0xFFFF) {
//         codePt -= 0x10000;
//         return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
//     }
//     else {
//         return String.fromCharCode(codePt);
//     }
// }

function unicodeStringLength(str) {
  const joiner = '\u{200D}'
  const split = str.split(joiner)
  let count = 0

  for (const s of split) {
    //removing the variation selectors
    const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join('')).length
    count += num
  }

  //assuming the joiners are used appropriately
  return count / split.length
}
