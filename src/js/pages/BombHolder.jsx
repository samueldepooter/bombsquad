import React, {Component} from 'react';
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
        <li className='player' key={i}>
          <div className='playerPictureWrap'>
            <img src={player.picture} className='playerPicture' onClick={() => onPassBomb(player)} />
          </div>
        </li>
      );
    });
  }

  render() {

    const {time, onOpenVault, possibleHolders, given, newBombHolder} = this.props;
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
              <h2>Turn your phone to unlock the door</h2>
          </header>

          <div className='wheelwrapper'>
            <div className='wheelFront'>
              <div className='status'></div>
            </div>
            <div className='wheelShadow'></div>
          </div>

          <div className='timeLockDisplay'>
            <p className='timeLeft'>Time left:</p>
            <p className='timer'>0:{doubleTime}</p>
          </div>

          <button onClick={e => onOpenVault(e)}>Open vault</button>

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
