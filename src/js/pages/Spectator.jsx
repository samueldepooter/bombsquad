import React, {Component} from 'react';

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
  onPassBomb: () => void
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

    const {time, bombHolder, possibleHolders, id} = this.props;

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

    if (!selected) {

      return (
        <div>
          <p>Current holder of the bomb: </p>
          <img src={bombHolder.picture} />
          <p>Time left: {time}</p>
        </div>
      );

    } else {

      return (
        <div>
          <p>Prepare yourself, you might receive the bomb!</p>
          <p>The bomb holder can pick from these players</p>
          <ul className='players'>
            {this.renderFutureBombHolders()}
          </ul>
        </div>
      );

    }

  }

}

export default Spectator;
