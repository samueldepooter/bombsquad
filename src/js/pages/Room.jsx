import React, {Component, PropTypes} from 'react';

class Room extends Component {

  state = {};

  renderPlayers() {
    const {playersInMyRoom} = this.props;

    return playersInMyRoom.map((player, i) => {
      return (
        <li className='player' key={i}>{player}</li>
      );
    });
  }

  render() {

    console.log(this.props);

    const {playersInMyRoom} = this.props;

    return (
      <div>
        <header>
          {/* <h1>Room: {this.props.params.id}</h1> */}
          <h1 className='title'>Room</h1>
        </header>

        <section>
          <h2 className='subtitle'>Host</h2>
          <p>{playersInMyRoom[0]}</p>
        </section>

        <section>
          <h2 className='subtitle'>Players</h2>
          <ul>
            {this.renderPlayers()}
          </ul>
        </section>

      </div>
    );
  }

}

Room.propTypes = {
  params: PropTypes.object,
  playersInMyRoom: PropTypes.array
};

export default Room;
