import React, {Component} from 'react';
import {Received, Rip, Selected} from '../components';
import double from '../globals/double';

type Player = {
  id: string,
  picture: string
}

type Powerups = {
  jammer: boolean
}

type Props = {
  time: number,
  bombHolder: Object,
  possibleHolders: Array<Player>,
  id: string,
  onSoundClick: () => void,
  onShieldClick: () => void,
  received: boolean,
  powerups: Powerups,
  error: string
}

class Spectator extends Component {

  props: Props
  state = {};

  renderFutureBombHolders() {
    const {possibleHolders} = this.props;

    return possibleHolders.map((player, i) => {
      return (
        <li className='playerPicture' style={{backgroundImage: `url(${player.picture})`}} key={i}></li>
      );
    });
  }

  renderPowerups(selected) {

    const {onShieldClick, onSoundClick} = this.props;

    this.addPowerupStyling();
    this.checkPowerupState(selected);

    return (
      <ul className='powerupsList'>
        <li className='shield powerup' onClick={() => onShieldClick()}></li>
        <li className='sound powerup' onClick={() => onSoundClick()}></li>
      </ul>
    );
  }

  addPowerupStyling() {

    const {powerups} = this.props;

    const shield = document.querySelector(`.shield`);
    const sound = document.querySelector(`.sound`);

    if (!shield) return;
    if (!sound) return;

    if (powerups.shield) shield.classList.add(`shieldactive`);
    else shield.classList.remove(`shieldactive`);

    if (powerups.jammer) sound.classList.add(`soundactive`);
    else sound.classList.remove(`soundactive`);

  }

  checkPowerupState(selected) {

    const {powerups} = this.props;

    //css removen wanneer je de powerup niet mag/kan gebruiken

    const shield = document.querySelector(`.shield`);
    const sound = document.querySelector(`.sound`);

    if (!shield) return;
    if (!sound) return;

    //ben je geselecteerd om de bom te krijgen
    if (selected) {
      if (powerups.shield) shield.classList.add(`shieldactive`);
      else shield.classList.remove(`shieldactive`);

      //sound kan je enkel gebruiken als iemand de safe nog niet geopend heeft
      sound.classList.remove(`soundactive`);
    } else {
      //standaard scherm dat je ziet als iemand anders de bom aan het unlocken is
      shield.classList.remove(`shieldactive`);
      if (powerups.jammer) sound.classList.add(`soundactive`);
      else sound.classList.remove(`soundactive`);
    }

  }

  renderError() {

    const {error} = this.props;

    if (!error) {
      return (
        <div className='errorNotificationWrap'>
          <p className='errorNotification'>{error}</p>
        </div>
      );

    }

    return (
      <div className='errorNotificationWrap errorShow'>
        <p className='errorNotification'>{error}</p>
      </div>
    );
  }

  render() {

    const {time, bombHolder, possibleHolders, id, received} = this.props;
    const doubleTime = double(time);

    const selected = possibleHolders.find(p => {return p.id === id;});

    if (time <= 0) {
      return <Rip bombHolder={bombHolder} />;
    } else if (received) {
      return <Received time={time} bombHolder={bombHolder} />;
    } else if (selected) {
      return <Selected selected={selected} renderError={() => this.renderError()} renderFutureBombHolders={() => this.renderFutureBombHolders()} renderPowerups={() => this.renderPowerups(selected)} />;
    } else {
      return (
        <section className='spectator phonewrapper'>
          <header className='globalheader'>
            <div className='screw screwleft'></div>
              <h2>Current holder of the bomb:</h2>
            <div className='screw screwright'></div>
          </header>

          <div className='playerPicture' style={{backgroundImage: `url(${bombHolder.picture})`}}></div>

          <div className='timeLockDisplay'>
            <p className='timeLeft'>Time left:</p>
            <p className='timer'>0:{doubleTime}</p>
          </div>

          <div className='powerupsWrapper'>
            <p>Powerups:</p>
            {this.renderPowerups(selected)}
          </div>

          {this.renderError()}

        </section>
      );
    }
  }

}

export default Spectator;
