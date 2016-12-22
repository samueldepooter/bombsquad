import React, {Component} from 'react';
import {isEmpty} from 'lodash';
import double from '../globals/double';
import Tone from 'tone';

let random;
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
  given: boolean
}

class BombHolder extends Component {

  state = {};

  number: number
  pitch: Object
  props: Props

  componentDidMount() {

    wheelFront = document.querySelector(`.wheelFront`);
    wheelShadow = document.querySelector(`.wheelShadow`);
    statusGreen = document.querySelector(`.statusGreen`);

    this.createPlayer();
    random = Math.round(((Math.random() * 80) - 80) / 10) * interval;
    this.handleDeviceRotation();
  }

  createAudioSettings() {
    pitch = new Tone.PitchShift(pitchCounter).toMaster();
  }

  createPlayer() {
    unlock = new Tone.Player(`../../assets/sounds/unlock.mp3`).toMaster();
    buffer = new Tone.Buffer(`../../assets/sounds/click.mp3`, () => {
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
    const {onOpenVault} = this.props;

    counter ++;
    statusGreen.style.opacity = ((counter / 100) * 2).toString();

    if (counter === 50) {
      unlock.start();
      onOpenVault();
      //next state
    }
  }


  renderFutureBombHolders() {
    const {possibleHolders, onPassBomb} = this.props;

    return possibleHolders.map((player, i) => {
      return (
        <li className='player' key={i}>
          <div className='playerPictureWrap'>
            <img src={player.picture} className='playerPicture' onClick={() => onPassBomb(player)} />
          </div>
        </li>
      );
    });
  }

  render() {

    const {time, possibleHolders, given, newBombHolder} = this.props;
    const doubleTime = double(time);

    if (given) {
      return (
        <div>
          <p>You gave the bomb to: </p>
          <img src={newBombHolder.picture} />
        </div>
      );
    }

    else if (!isEmpty(possibleHolders)) {
      return (
        <div>
          <p>Choose someone that deserves the bomb</p>

          <ul className='players'>
            {this.renderFutureBombHolders()}
          </ul>

          <div className='timeLockDisplay'>
            <p className='timeLeft'>Time left:</p>
            <p className='timer'>0:{doubleTime}</p>
          </div>
        </div>
      );
    }

    else {
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
            <p className='timeLeft'>Time left:</p>
            <p className='timer'>0:{doubleTime}</p>
          </div>

          {/* <button onClick={e => onOpenVault(e)}>Open vault</button> */}

          {/* <div className='totalTime'>
            <div className='currentTime'></div>
          </div> */}

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
