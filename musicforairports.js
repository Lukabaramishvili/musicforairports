const SAMPLE_LIBRARY = {
  'Grand Piano': [
    { note: 'A',  octave: 4, file: 'Grand Piano/piano-f-a4.wav' },
    { note: 'A',  octave: 5, file: 'Grand Piano/piano-f-a5.wav' },
    { note: 'A',  octave: 6, file: 'Grand Piano/piano-f-a6.wav' },
    { note: 'C',  octave: 4, file: 'Grand Piano/piano-f-c4.wav' },
    { note: 'C',  octave: 5, file: 'Grand Piano/piano-f-c5.wav' },
    { note: 'C',  octave: 6, file: 'Grand Piano/piano-f-c6.wav' },
    { note: 'D#',  octave: 4, file: 'Grand Piano/piano-f-d#4.wav' },
    { note: 'D#',  octave: 5, file: 'Grand Piano/piano-f-d#5.wav' },
    { note: 'D#',  octave: 6, file: 'Grand Piano/piano-f-d#6.wav' },
    { note: 'F#',  octave: 4, file: 'Grand Piano/piano-f-f#4.wav' },
    { note: 'F#',  octave: 5, file: 'Grand Piano/piano-f-f#5.wav' },
    { note: 'F#',  octave: 6, file: 'Grand Piano/piano-f-f#6.wav' }
  ]
};

flatToSharp = (note) => {
    switch (note) {
      case 'Bb': return 'A#';
      case 'Db': return 'C#';
      case 'Eb': return 'D#';
      case 'Gb': return 'F#';
      case 'Ab': return 'G#';
      default:   return note;
    }
  }

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

noteValue = (note, octave) => {
    return octave * 12 + OCTAVE.indexOf(note);
}

getNoteDistance = (note1, octave1, note2, octave2) => {
    return noteValue(note1, octave1) - noteValue(note2, octave2);
}

function getNearestSample(sampleBank, note, octave) {
    let sortedBank = sampleBank.slice().sort((sampleA, sampleB) => {
      let distanceToA =
        Math.abs(getNoteDistance(note, octave, sampleA.note, sampleA.octave));
      let distanceToB =
        Math.abs(getNoteDistance(note, octave, sampleB.note, sampleB.octave));
      return distanceToA - distanceToB;
    });
    return sortedBank[0];
  }

let audioContext = new AudioContext();

fetchSample = (path) => {
    return fetch(encodeURIComponent(path))
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

getSample = (instrument, noteAndOctave) => {
    let [, requestedNote, requestedOctave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
    requestedOctave = parseInt(requestedOctave, 10);
    requestedNote = flatToSharp(requestedNote);
    let sampleBank = SAMPLE_LIBRARY[instrument];
    let sample = getNearestSample(sampleBank, requestedNote, requestedOctave);
    let distance =
      getNoteDistance(requestedNote, requestedOctave, sample.note, sample.octave);
    return fetchSample(sample.file).then(audioBuffer => ({
      audioBuffer: audioBuffer,
      distance: distance
    }));
  }
  
 playSample = (instrument, note, delaySeconds = 0) => {
    getSample(instrument, note).then(({audioBuffer, distance}) => {
      let playbackRate = Math.pow(2, distance / 12);
      let bufferSource = audioContext.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.playbackRate.value = playbackRate;
      bufferSource.connect(audioContext.destination);
      bufferSource.start(audioContext.currentTime + delaySeconds);
    });
  }

// setInterval(() => playSample('Grand Piano', 'C4'), 20000);

startLoop = (instrument, note, loopLengthSeconds, delaySeconds) => {
    playSample(instrument, note, delaySeconds);
    setInterval(
      () => playSample(instrument, note, delaySeconds),
      loopLengthSeconds * 1000
    );
}

// startLoop('Grand Piano', 'C5', 20, 5);