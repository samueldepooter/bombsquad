import React, {Component} from 'react';
import {Given, PassBomb} from '../components';
import {isEmpty} from 'lodash';
import double from '../globals/double';

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

  props: Props;
  state = {};

  renderFutureBombHolders() {
    const {possibleHolders, onPassBomb} = this.props;

    return possibleHolders.map((player, i) => {
      return (
        <li className='playerPicture' style={{backgroundImage: `url(${player.picture})`}} key={i} onClick={() => onPassBomb(player)}></li>
      );
    });
  }

  render() {

    const {time, onOpenVault, possibleHolders, given, newBombHolder} = this.props;
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
              <h2>Turn your phone to unlock the door</h2>
          </header>

          <div className='wheelwrapper'>
            <div className='wheelFront'>
              <div className='status'></div>
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
