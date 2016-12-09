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

    const {code} = this.refs;

    const {checkRoom} = this.props;
    checkRoom(code.value);
  }

  render() {

    const {addRoom} = this.props;

    return (
      <div>
        <header>
          <h1 className='title'>Pass da bomb</h1>
        </header>

        <Link to={`/rooms/create`} className='btn' onClick={() => addRoom()}>Add room</Link>

        <form onSubmit={e => this.submitCode(e)}>
          <label htmlFor='code'>Typ je code in</label>
          <input ref={`code`} type='text' placeholder='code van de room' />
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
  addRoom: PropTypes.func,
  checkRoom: PropTypes.func
};

export default Menu;
