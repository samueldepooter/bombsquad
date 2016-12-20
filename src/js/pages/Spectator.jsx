import React, {Component} from 'react';
import double from '../globals/double';

type Player = {
  id: string,
  picture: string,
  room: string
}

type Props = {
  time: number,
  bombHolder: Object,
  possibleHolders: Array<Player>,
  id: string,
  onPassBomb: () => void,
  received: boolean
}

class Spectator extends Component {

  props: Props
  state = {};

  renderFutureBombHolders() {
    const {possibleHolders, onPassBomb} = this.props;

    return possibleHolders.map((player, i) => {
      return (
        <li className='playerPicture' style={{backgroundImage: `url(${player.picture})`}} onClick={() => onPassBomb(player)} key={i}></li>
      );
    });
  }

  activateShield() {
    console.log(`shield`);
  }

  activateSound() {
    console.log(`sound`);
  }

  render() {

    const {time, bombHolder, possibleHolders, id, received} = this.props;
    const doubleTime = double(time);

    const selected = possibleHolders.find(p => {
      return p.id === id;
    });

    if (time <= 0) {
      return (
        <div>
          <p>{bombHolder.id} died! Prepare, looking for a new holder...</p>
        </div>
      );
    }

    else if (received) {

      return (
        <div>
          <p>You have received the bomb from: </p>
          <img src={bombHolder.picture} />
      </div>
      );

    }

    else if (!selected) {

      return (
      <section className='spectator phonewrapper'>
        <header className='globalheader'>
          <div className='screw screwleft'></div>
            <h2>Current holder of the bomb:</h2>
          <div className='screw screwright'></div>
        </header>
        <div>
          <p></p>
          <div className='playerPicture' style={{backgroundImage: `url(${bombHolder.picture})`}}></div>
          <div className='timeLockDisplay'>
            <p className='timeLeft'>Time left:</p>
            <p className='timer'>0:{doubleTime}</p>
          </div>
        </div>
        <div className='powerupsWrapper'>
          <p>Powerups:</p>
          <ul className='powerupsList'>
            <li className='shield powerup shieldactive' onClick={() => this.activateShield()}></li>
            <li className='sound powerup' onClick={() => this.activateSound()}></li>
          </ul>
        </div>
      </section>
      );

    } else {

      return (
        <div>
          <p>Prepare yourself, you might receive the bomb!</p>
          <p>The bomb holder can pick from these players</p>
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

  }

}

export default Spectator;
