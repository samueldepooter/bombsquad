//@flow

import React, {Component} from 'react';
import {Given, PassBomb} from '../components';
import {isEmpty} from 'lodash';
import double from '../globals/double';
import Tone from 'tone';

let rotationValue = 0;
let counter = 0;

let jamSource;
let jammedLocal = false;


//dynamische values
const interval = 10;

type Player = {
  id: string,
  picture: string,
  room: string
}

type Props = {
  time: number,
  onOpenVault: () => void,
  onPassBomb: () => void,
  possibleHolders: Array<Player>,
  newBombHolder: Player,
  given: boolean,
  jammed:boolean
}

class BombHolder extends Component {

  state = {};

  number: number
  pitch: Object
  props: Props
  wheelFront: HTMLElement
  wheelShadow: HTMLElement
  statusGreen: HTMLElement
  unlock: Object
  deviceOrientation: ()=>void
  gamma: number
  rotationGamma: number
  random: number
  gain: Object
  clickSound: Object
  clickSoundBuffer: Object
  jammerSound: Object
  jammerSoundBuffer:Object
  distance:number


  componentDidMount() {

    this.wheelFront = document.querySelector(`.wheelFront`);
    this.wheelShadow = document.querySelector(`.wheelShadow`);
    this.statusGreen = document.querySelector(`.statusGreen`);

    this.unlock = new Tone.Player(`../../assets/sounds/unlock.mp3`).toMaster();

    this.generateRandom();
    this.createClickSound();
    this.createJammerSound();
    this.createPitch();
    this.createGain();
    // this.playJammer();

    this.deviceOrientation = eventData => {

      if (eventData) this.rotationGamma = eventData.gamma;
      this.rotationGamma = Math.round(this.rotationGamma);
      this.divideAngle(this.rotationGamma);

      this.wheelFront.style.transform = `rotate(${rotationValue.toString()}deg)`;
      this.wheelShadow.style.transform = `rotate(${rotationValue.toString()}deg)`;

      this.checkRotation();
      this.calculateDistanceToSound();
      this.generatePitch();
      this.generateGain();
      this.playJammer();

    };

    window.addEventListener(`deviceorientation`, this.deviceOrientation, false);

  }

  generateRandom() {
    do {
      this.random = Math.round(((Math.random() * 80) - 80) / 10) * interval;
    } while (Math.abs(this.random) === 0);

    console.log(this.random);
  }

  createPitch() {
    this.pitch = new Tone.PitchShift(0).toMaster();
  }

  createGain() {
    this.gain = new Tone.Gain(1).toMaster();
  }

  createClickSound() {
    this.clickSound = new Tone.Buffer(`../../assets/sounds/click.mp3`, () => {
      this.clickSoundBuffer = this.clickSound.get();
    });
  }

  createJammerSound() {
    this.jammerSound = new Tone.Buffer(`../../assets/sounds/jammer.mp3`, () => {
      this.jammerSoundBuffer = this.jammerSound.get();
    });
  }

  playJammer() {

    const {jammed} = this.props;

    console.log(`jammed:`, jammed, `jammedlocal:`, jammedLocal);

    if (jammed && !jammedLocal) {
      jamSource = Tone.context.createBufferSource();
      jamSource.buffer = this.jammerSoundBuffer;
      jamSource.connect(this.gain);
      this.gain.connect(Tone.context.destination);
      jamSource.start();
      jammedLocal = true;
    }
  }

  playSound(buffer: Object) {
    const source = Tone.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.pitch);
    source.start();
  }

  checkRotation() {
    if (this.rotationGamma < this.random + (interval / 2) && this.rotationGamma > this.random - (interval / 2)) {
      this.checkLock();
    } else {
      this.statusGreen.style.opacity = `0`;
      counter = 0;
    }
  }

  divideAngle(rotationGamma: number) {

    if (rotationGamma % interval === 0) {
      if (rotationGamma !== rotationValue) {
        this.playSound(this.clickSoundBuffer);
      }
      rotationValue = rotationGamma;
    }
  }

  calculateDistanceToSound() {
    this.distance = Math.abs((this.random - rotationValue) / interval);
  }

  generatePitch() {
    if (!this.pitch) {
      return;
    }
    this.pitch.pitch = (- this.distance) * 2;
    // console.log(this.pitch.pitch);
  }

  generateGain() {
    if (!this.gain) {
      return;
    }
    // console.log(this.gain);
    // this.gain.gain.value = (90 - (this.distance / 2)) / 2;
    this.gain.gain.value = this.map(this.distance * 10, 0, 160, 3, 0);
    console.log(`mappinge`, this.map(this.distance * 10, 0, 160, 3, 0));
    console.log(`distance`, this.distance);

    // console.log(`luidheid:`, (5 + this.distance) / 10);
  }

  map(value: number, currentMin: number, currentMax: number, futureMin: number, futureMax: number) {
    return (value - currentMin) / (currentMax - currentMin) * (futureMax - futureMin) + futureMin;
  }

  checkLock() {
    const {onOpenVault} = this.props;

    counter ++;
    this.statusGreen.style.opacity = ((counter / 100) * 2).toString();

    if (counter >= 50) {
      this.unlock.start();
      window.removeEventListener(`deviceorientation`, this.deviceOrientation, false);
      jamSource.stop();
      onOpenVault();
    }
  }

  renderFutureBombHolders() {
    const {possibleHolders, onPassBomb} = this.props;

    return possibleHolders.map((player, i) => {
      return (
        <li className='playerPicture' style={{backgroundImage: `url(${player.picture})`}} key={i} onClick={() => onPassBomb(player)}></li>
      );
    });
  }

  render() {

    const {time, possibleHolders, given, newBombHolder, onOpenVault} = this.props;
    const doubleTime = double(time);

    if (given) {
      return <Given newBombHolder={newBombHolder} time={time} />;
    } else if (!isEmpty(possibleHolders)) {
      return <PassBomb time={doubleTime} renderFutureBombHolders={() => this.renderFutureBombHolders()} />;
    } else {
      return (
        <section className='lock'>
          <header className='turnPhone'>
              <div className='phoneIcon'></div>
              <h2 className='testTurns'>Turn your phone to unlock the door</h2>
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

          <div className='timeLockDisplay'>
            <p className='timeLeft'>Time left</p>
            <p className='timer'>0:{doubleTime}</p>
          </div>

          <button onClick={e => onOpenVault(e)}>Open vault</button>

          <div className='screw topleft'></div>
          <div className='screw topright'></div>
          <div className='screw bottomright'></div>
          <div className='screw bottomleft'></div>
        </section>

      );
    }
  }

}

export default BombHolder;
