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
        <li className='player' key={i}>
          <div className='playerPictureWrap'>
            <img src={player.picture} className='playerPicture' onClick={() => onPassBomb(player)} />
          </div>
        </li>
      );
    });
  }

  render() {

    const {time, bombHolder, possibleHolders, id, received} = this.props;
    const doubleTime = double(time);

    const selected = possibleHolders.find(p => {
      return p.id === id;
    });

    console.log(time);

    if (time <= 0) {
      return (
        <section className='winner phonewrapper'>
          <header className='globalheader'>
            <div className='screw screwleft'></div>
            <div className='titleWinnerWrapper'>
              <div className='winnerBombImage'></div>
              <h2>RIP</h2>
            </div>
            <div className='screw screwright'></div>
          </header>
          <div className='winnerPicture'>
            <div className='playerPicture' style={{backgroundImage: `url(${bombHolder.picture})`}}></div>
            <p>The player didn't make it. Let's look for a new victim!</p>
          </div>
        </section>
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

    else if (selected) {

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

    } else {

      return (
      <div>
        <p>Current holder of the bomb: </p>
        <img src={bombHolder.picture} />

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
