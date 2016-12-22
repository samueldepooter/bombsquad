  //@flow
import React, {Component} from 'react';
import Tone from 'tone';

let random = ``;
let rotationGamma;
let rotationValue = 0;
let counter = 0;

let pitch;
let unlock;

let buffer;
let source;

let buff;
const pitchCounter = 0;

let wheelFront, wheelShadow, statusGreen;

//dynamische values
const interval = 10;

class Rotation extends Component {

  componentDidMount() {

    wheelFront = document.querySelector(`.wheelFront`);
    wheelShadow = document.querySelector(`.wheelShadow`);
    statusGreen = document.querySelector(`.statusGreen`);

    this.createPlayer();
    random = Math.round(((Math.random() * 80) - 80) / 10) * interval;
    console.log(random);
    this.handleDeviceRotation();
  }

  createAudioSettings() {
    pitch = new Tone.PitchShift(pitchCounter).toMaster();
  }

  createPlayer() {
    unlock = new Tone.Player(`./assets/sounds/unlock.mp3`).toMaster();
    buffer = new Tone.Buffer(`./assets/sounds/click.mp3`, () => {
      buff = buffer.get();
      this.createAudioSettings();
    });
  }

  playSound() {
    source = Tone.context.createBufferSource();
    source.buffer = buff;
    source.connect(pitch);
    source.start();
  }

  handleDeviceRotation() {

    window.addEventListener(`deviceorientation`, eventData => {

      rotationGamma = eventData.gamma;
      rotationGamma = Math.round(rotationGamma);
      this.divideAngle(rotationGamma);

      wheelFront.style.transform = `rotate(${rotationValue.toString()}deg)`;
      wheelShadow.style.transform = `rotate(${rotationValue.toString()}deg)`;

      if (rotationGamma < random + (interval / 2) && rotationGamma > random - (interval / 2)) {
        this.checkLock();
      } else {
        statusGreen.style.opacity = `0`;
        counter = 0;
      }
      this.distanceToSound();
    });
  }

  divideAngle(rotationGamma) {
    if (rotationGamma % interval === 0) {
      if (rotationGamma !== rotationValue) {
        this.playSound();
      }
      rotationValue = rotationGamma;
    }
  }

  distanceToSound() {
    if (!pitch) {
      return;
    }
    const distance = - Math.abs((random - rotationValue) / interval);
    pitch.pitch = distance * 2;
  }

  checkLock() {
    counter ++;
    statusGreen.style.opacity = ((counter / 100) * 2).toString();

    if (counter === 50) {
      unlock.start();
      //next state
    }
  }

  render() {

    return (
      <section className='lock'>
        <header className='turnPhone'>
            <div className='phoneIcon'></div>
            <h2 className='testTurns'></h2>
            <h2 className='testTurns2'></h2>
        </header>

        <div className='wheelwrapper'>
          <div className='wheelFront'>
            <div className='statusWrapper'>
              <div className='statusGreen'></div>
              <div className='status'></div>
            </div>
          </div>
          <div className='wheelShadow'></div>
        </div>
        <audio></audio>
      </section>
    );
  }
}

export default Rotation;
