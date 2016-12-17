//@flow

import React, {Component} from 'react';

type Player = {
  id: string,
  picture: string
};

class Room extends Component {

  state = {};

  props: {
    playersInMyRoom: Array<Player>,
    roomId: string,
    myId: string,
    onStartGame: () => void
  }

  renderPlayers() {
    const {playersInMyRoom, myId} = this.props;

    return playersInMyRoom.map((player, i) => {
      let name = player.id;
      if (player.id === myId) name = `Ik`;
      return (
        <li className='player' key={i}>
          <p>{name}</p>
          <div className='playerPictureWrap'>
            <img className='playerPicture' src={player.picture} />
          </div>
        </li>
      );
    });
  }

  renderStartButton() {
    const {myId, playersInMyRoom, onStartGame} = this.props;

    if (!playersInMyRoom[0]) return;

    //als ik niet de eerste in de room ben, dan ben ik niet de host
    if (myId !== playersInMyRoom[0].id) return;

    return (
      <button onClick={() => onStartGame()}>Start de game!</button>
    );
  }

  renderHostName() {
    const {myId, playersInMyRoom} = this.props;

    if (!playersInMyRoom[0]) return;

    let host = playersInMyRoom[0].id;
    if (myId === playersInMyRoom[0].id) host = `Jij bent de host`;

    return (
      <p>{host}</p>
    );
  }

  render() {

    const {roomId} = this.props;

    return (
      <div>
        <header>
          <h1 className='title'>Code: {roomId}</h1>
        </header>

        <section>
          <h2 className='subtitle'>Host</h2>
          {this.renderHostName()}
        </section>

        <section>
          <h2 className='subtitle'>Players</h2>
          <ul>
            {this.renderPlayers()}
          </ul>
        </section>

        {this.renderStartButton()}

      </div>
    );
  }

}


export default Room;
