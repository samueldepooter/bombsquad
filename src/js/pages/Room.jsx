// @flow

import React, {Component} from 'react';

type player = {
  id: string,
  picture: string
};

class Room extends Component {

  state = {};

  props: {
    playersInMyRoom: Array<player>,
    roomId: number
  }

  renderPlayers() {
    const {playersInMyRoom} = this.props;
    console.log(playersInMyRoom);

    return playersInMyRoom.map((player, i) => {
      console.log(player);
      return (
        <li className='player' key={i}>{player.id}</li>
      );
    });
  }

  render() {

    const {playersInMyRoom, roomId} = this.props;

    return (
      <div>
        <header>
          <h1 className='title'>Code: {roomId}</h1>
        </header>

        <section>
          <h2 className='subtitle'>Host</h2>
          <p>{playersInMyRoom[0].id}</p>
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

export default Room;
