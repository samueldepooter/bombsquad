//@flow

import React, {Component} from 'react';
import {Link} from 'react-router';

type Player = {
  id: string,
  picture: string
}

type Props = {
  players: Array<Player>,
  onCheckRoom: () => void,
  onAddRoom: () => void
}

class Menu extends Component {

  props: Props;
  code: Object;

  renderPlayers() {

    const {players} = this.props;

    return players.map((player, i) => {
      return (
        <li className='player' key={i}>{player.id}</li>
      );
    });
  }

  submitCode(e: Object) {
    e.preventDefault();
    console.log(`Submit`);

    const {onCheckRoom} = this.props;
    onCheckRoom(this.code.value);
  }

  render() {

    const {onAddRoom} = this.props;

    return (
      <div>
        <header>
          <h1 className='title'>Bomb Squad</h1>
        </header>

        <Link to={`/rooms/create`} className='btn' onClick={() => onAddRoom()}>Add room</Link>

        <form onSubmit={e => this.submitCode(e)}>
          <label htmlFor='code'>Typ je code in</label>
          <input ref={code => this.code = code} type='text' placeholder='code van de room' />
        </form>

        <section>
          <h2 className='subtitle'>Players op de server</h2>
          <ul className='players'>
            {this.renderPlayers()}
          </ul>
        </section>
      </div>
    );
  }
}

// Menu.contextTypes = {
//   router: PropTypes.object
// };

export default Menu;
