// @flow

import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
//
// type Props = {
//   players: Array<string>
// }

class Menu extends Component {

  //props: Props;

  renderPlayers() {

    const {players} = this.props;
    console.log(players);

    return players.map((player, i) => {
      return (
        <li className='player' key={i}>{player.id}</li>
      );
    });
  }

  submitCode(e) {
    e.preventDefault();
    console.log(`Submit`);

    const {checkRoom} = this.props;
    checkRoom(this.code.value);

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

Menu.propTypes = {
  players: PropTypes.array,
  onAddRoom: PropTypes.func,
  checkRoom: PropTypes.func
};

// Menu.contextTypes = {
//   router: PropTypes.object
// };

export default Menu;
