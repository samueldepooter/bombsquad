import React, {Component} from 'react';
import {isEmpty} from 'lodash';

type Player = {
  id: string,
  picture: string,
  room: string
}

type Props = {
  time: number,
  onOpenVault: () => void,
  onPassBomb: () => void,
  possibleHolders: Array<Player>
}

class BombHolder extends Component {

  props: Props;
  state = {};

  renderFutureBombHolders() {
    const {possibleHolders, onPassBomb} = this.props;

    return possibleHolders.map((player, i) => {
      return (
        <li className='player' key={i}>
          {/* <p>{name}</p> */}
          <div className='playerPictureWrap'>
            <img src={player.picture} className='playerPicture' onClick={() => onPassBomb(player)} />
          </div>
        </li>
      );
    });
  }

  render() {

    const {time, onOpenVault, possibleHolders} = this.props;

    if (!isEmpty(possibleHolders)) {
      return (
        <div>
          <p>Choose someone that deserves the bomb</p>

          <ul className='players'>
            {this.renderFutureBombHolders()}
          </ul>

          <p>Time left: {time}</p>
        </div>
      );
    } else {
      return (
        <div>
          <p>Turn your phone to unlock the door</p>
          <p>Time left: {time}</p>
          <button onClick={e => onOpenVault(e)}>Open vault</button>
        </div>
      );
    }
  }

}

export default BombHolder;
