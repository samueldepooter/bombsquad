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
    room: string,
    myId: string,
    onStartGame: () => void
  }

  roomCode: Object;


  renderPlayers() {
    const {playersInMyRoom} = this.props;

    return playersInMyRoom.map((player, i) => {
      if (player.picture) {
        return (
          <li className='playerPicture' style={{backgroundImage: `url(${player.picture})`}} key={i}></li>
        );
      } else {
        return (
            <li className='playerPicture' key={i}>
              <div className='dotAnimationWrapper'>
                <span className='dot1'>.</span>
                <span className='dot2'>.</span>
                <span className='dot3'>.</span>
              </div>
            </li>
        );
      }
    });
  }

  renderStartButton() {
    const {myId, playersInMyRoom, onStartGame} = this.props;

    if (!playersInMyRoom[0]) return;

    //als ik niet de eerste in de room ben, dan ben ik niet de host
    if (myId !== playersInMyRoom[0].id) return;

    if (playersInMyRoom.length < 2) { //min x personen om te starten
      return (
        <button disabled className='button'><span className='startButtonText'> Waiting for more players </span><div className='dotAnimationWrapper'> <span className='dot1'>.</span><span className='dot2'>.</span><span className='dot3'>.</span> </div> </button>
      );
    } else {
      return (
        <button className='button' onClick={() => onStartGame()}>Start game</button>
      );
    }
  }

  copyCode() {
    const notification = document.querySelector(`.copyNotification`);
    this.showNotification(notification);

    const copyTextarea = this.roomCode;
    copyTextarea.select();
    document.execCommand(`copy`);
  }

  showNotification(node: HTMLElement) {
    node.style.bottom = `0rem`;
    setTimeout(() => {
      node.style.bottom = `-7rem`;
    }, 1500);
  }

  render() {

    const {room, playersInMyRoom} = this.props;
    const roomIdString = room.toString();

    return (

      <section className='room phonewrapper'>

        <header className='globalheader'>
          <div className='screw screwleft'></div>
          <h2>Share this code to let your friends join!</h2>
          <div className='screw screwright'></div>
        </header>

        <div className='codewrapper'>
          <section className='code'>
            <header className='hidden'>
              <h3>Room Code</h3>
            </header>
            <ul className='codelist' >
              <li className='codenumber'>{roomIdString.charAt(0)}</li>
              <li className='codenumber'>{roomIdString.charAt(1)}</li>
              <li className='codenumber'>{roomIdString.charAt(2)}</li>
              <li className='codenumber'>{roomIdString.charAt(3)}</li>
            </ul>
            <textarea className='roomCode' ref={roomCode => this.roomCode = roomCode} value={roomIdString} readOnly></textarea>
            <button className='copyCodeButton' onClick={() => this.copyCode()}></button>
          </section>
        </div>
        <div className='coolBorder'></div>

        <section className='playersWrapper'>
          <h3 className='subtitle'>Players: {playersInMyRoom.length}</h3>
          <ul className='players'>
            {this.renderPlayers()}
          </ul>
        </section>

        <div className='startbutton'>
          {this.renderStartButton()}
        </div>
        <div className='copyNotification'><p>Code copied!</p></div>

      </section>

    );
  }

}


export default Room;
