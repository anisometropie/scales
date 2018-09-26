const naturalScale = ["C", "D", "E", "F", "G", "A", "B"];
const major = [2, 2, 1, 2, 2, 2, 1];
const harmonicMinor = [2, 1, 2, 2, 1, 3, 1];
const ascendingMelodicMinor = [2, 1, 2, 2, 2, 2, 1];
const descendingMelodicMinor = [2, 1, 2, 2, 1, 2, 2];

class Scale {
    // aOptionalOffset to lower/raise the whole scale by the chosen amount of octaves
    constructor(aTonicName, aMode, aArrayIndex, aOptionalOffset) {
        this.notes = [];
        this.mode = aMode.slice();
        this.arrayIndex = aArrayIndex;
        if (typeof aOptionalOffset !== "undefined" ) {
            this.offset = aOptionalOffset;
        }
        else {
            this.offset = 0;
        }
        this.build(aTonicName, 3);
        this.playButton = new Button(this.arrayIndex, this.notes[0].yGrid-1);
        this.noteTimers = [];
    }

    play() {
        console.log("playing the scale");
        let l_scaleNotes = this.notes;
        let l_noteIndex = 0;
        let that = this;
        let l_noteTimer = setInterval(function() {
            l_scaleNotes[l_noteIndex].play();
            if (l_noteIndex<l_scaleNotes.length-1) {
                l_noteIndex++;
            }
            else {
                let l_index = that.noteTimers.indexOf(l_noteTimer);
                that.noteTimers.splice(l_index, 1);
                clearInterval(l_noteTimer);
            }
        }, 250);
        this.noteTimers.push(l_noteTimer);
    }

    // called every frame
    pixelMove() {
        let l_moveAll = false;
        if (this.notes[0].isBeingMoved) {
            l_moveAll = true;
        }
        for (let i=0; i<this.notes.length; i++) {
            if (this.notes[i].isBeingMoved) {
                if (l_moveAll || this.notes[i].isTonic) {
                    this.notes[i].xPixel += mouseX - pmouseX;
                }
                this.notes[i].yPixel += mouseY - pmouseY;
            }
        }
        if (this.playButton.isBeingMoved) {
            this.playButton.xPixel += mouseX - pmouseX;
            this.playButton.yPixel += mouseY - pmouseY;
        }
    }

    // called every frame
    display() {
        for (let i=0; i<this.notes.length; i++) {
            this.notes[i].display();
        }
        if (this.isMouseOver()) {
            this.playButton.display();
        }
    }

    isMouseOver() {
        let l_threshold = this.notes[0].radius * 1.5;
        let l_isMouseOver = mouseX > this.notes[0].xPixel - l_threshold &&
                            mouseX < this.notes[0].xPixel + l_threshold &&
                            mouseY > this.notes[this.notes.length-1].yPixel - l_threshold &&
                            mouseY < this.playButton.yPixel + l_threshold;
        return l_isMouseOver;
    }

    consoleShow() {
        let l_notes = [];
        for (let i=0; i<this.notes.length; i++) {
            l_notes[i] = [];
            l_notes[i][0] = this.notes[i].name;
            l_notes[i][1] = this.notes[i].frequency;
        }
        console.log(l_notes);
    }

    // https://fr.wikipedia.org/wiki/Gamme_naturelle
    // build option to use just intonation
    build(aTonicName, aStartingGridY) {
        if (Array.isArray(this.mode)) {
            let l_gridX = this.arrayIndex;
            let l_gridY = aStartingGridY;
            let l_frequency = this.parseFrequencyFromName(aTonicName, true);
            this.notes[0] = new Note(aTonicName, l_gridX, l_gridY, true, l_frequency);
            // this.playButton.position(l_gridX)
            // building the scale second by second from the tonic
            for (let i=1; i<=this.mode.length; i++) {
                l_gridY += this.mode[i-1];
                let l_noteName = findNoteFromInterval(this.notes[i-1].name, 2, this.mode[i-1]);
                l_frequency = this.parseFrequencyFromName(l_noteName, false, l_gridY);
                this.notes[i] = new Note(l_noteName, l_gridX, l_gridY, false, l_frequency);
            }
        }
    }

    parseMode() {
        for (let i=0; i<this.mode.length; i++) {
            this.mode[i] = this.notes[i+1].yGrid - this.notes[i].yGrid;
        }
    }

    parseFrequencyFromName(aNoteName, aIsTonic, aNoteGridY) {
        let l_frequency = EQUAL_TEMPERAMENT_FREQ.get(aNoteName);
        l_frequency *= Math.pow(2, this.offset);
        if (aIsTonic) {
            return l_frequency;
        }
        else {
            if (l_frequency <= this.notes[0].frequency) {
                l_frequency *= 2;
            }
            else if (aNoteGridY > this.notes[0].yGrid + 12) {
                l_frequency *= 2;
            }
            return l_frequency;
        }
    }

    isOutOfBound() {
        if (this.notes[0].xGrid < -1 || this.notes[0].xGrid > maxNumberOfScales) {
            return true;
        }
        else {
            return false;
        }
    }

    mousePressed() {
        let l_didSomething = false;
        for (let i=0; i<this.notes.length; i++) {
            if (this.notes[i].isMouseOver()) {
                if (mouseButton === RIGHT) {
                    l_didSomething = true;
                    if (this.notes[i].isTonic) {
                        for (let j=0; j<this.notes.length; j++) {
                            this.notes[j].isBeingMoved = true;
                            this.notes[j].pYGrid = this.notes[j].yGrid;
                        }
                        this.playButton.isBeingMoved = true;
                        this.playButton.pYGrid = this.playButton.yGrid;
                    }
                    else {
                        this.notes[i].isBeingMoved = true;
                        this.notes[i].pYGrid = this.notes[i].yGrid
                    }
                }
                else if (mouseButton === LEFT) {
                    this.notes[i].play();
                    l_didSomething = true;
                }
            }
        }
        if (this.playButton.isMouseOver() && mouseButton === LEFT) {
            this.play();
            l_didSomething = true;
        }
        return l_didSomething;
    }

    mouseReleased() {
        if (mouseButton === RIGHT) {
            if (this.notes[0].isBeingMoved) {
                for (let i=0; i<this.notes.length; i++) {
                    this.notes[i].isBeingMoved = false;
                    this.notes[i].mapGridCoords();
                    this.notes[i].mapPixelCoords();
                }
                this.playButton.isBeingMoved = false;
                this.playButton.mapGridCoords();
                this.playButton.mapPixelCoords();
                if (this.isOutOfBound()) {
                    deleteScale(this);
                }
            }
            else {
                for (let i=0; i<this.notes.length; i++) {
                    if (this.notes[i].isBeingMoved) {
                        this.notes[i].isBeingMoved = false;
                         // new yGrid
                        this.notes[i].mapGridCoords();
                        let l_newY;
                        // if the note is not on another note or where it was and is not below the lowest note
                        // using pYGrid because notes that did not move yGrid = pYGrid,
                        // and for this note that just moved, pYGrid that says where it was
                        // TODO : change pYGrid, that should be a local stuff, not a field of the object!
                        let thisScale = this;
                        let isNotOnAnotherNote = this.notes.every( function(aNote) {
                            return aNote.name !== thisScale.notes[i].name ? aNote.yGrid !== thisScale.notes[i].yGrid  :
                                                                            aNote.yGrid !== thisScale.notes[i].pYGrid ; });
                        if ( isNotOnAnotherNote && this.notes[i].yGrid > this.notes[0].yGrid ) {
                            l_newY = true;
                        }
                        else {
                            this.notes[i].yGrid = this.notes[i].pYGrid;
                            l_newY = false;
                        }
                        this.notes[i].mapPixelCoords();
                        // if the note has a new y coordinate on the grid, sort the array, change the name of the note
                        if(l_newY) {
                            // find the note in the scale just before the new note location
                            let l_previousNoteInTheScale = this.notes[0];
                            for (let j=0; j<this.notes.length; j++) {
                                if (this.notes[j].yGrid < this.notes[i].yGrid && this.notes[j].yGrid > l_previousNoteInTheScale.yGrid) {
                                    l_previousNoteInTheScale = this.notes[j];
                                }
                            }
                            let l_semitone = this.notes[i].yGrid - l_previousNoteInTheScale.yGrid;
                            this.notes[i].name = findNoteFromInterval(l_previousNoteInTheScale.name, 2, l_semitone);
                            this.notes[i].frequency = this.parseFrequencyFromName(this.notes[i].name, false, this.notes[i].yGrid);
                            this.notes.sort( function(noteA, noteB) {
                                return noteA.yGrid - noteB.yGrid;
                            });
                            this.parseMode();
                        }
                    }
                }
            }
        } // end right button
    } // end mouseReleased()

    delete() {
        this.notes.length = 0;
        this.playButton = null;
        for (let i=0; i<this.noteTimers.length; i++) {
            clearInterval(this.noteTimers[i]);
        }
        this.noteTimers.length = 0;
    }
}

function createMode(aNote) {
    let mode = [];
    let noteIndex = findNoteIndex(aNote);
    for (let i=0; i<major.length; i++) {
        mode[i] = major[(noteIndex + i)%7];
    }
    return mode;
}
