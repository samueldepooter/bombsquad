import React, {Component} from 'react';
import {Match, Redirect} from 'react-router';
import Router from 'react-router/BrowserRouter';
import IO from 'socket.io-client';

import {Menu, Test, Room} from '../pages/';

let router = undefined;

class App extends Component {

  state = {
    players: [],
    playersInMyRoom: []
  };

  componentDidMount() {
    this.initSocket();
  }

  initSocket() {
    this.socket = IO(`/`);

    this.socket.on(`connect`, this.initPeer);

    //1 player toevoegen als je reeds gejoined bent en iemand anders joined ook
    this.socket.on(`addPlayer`, player => this.addPlayer(player));
    this.socket.on(`removePlayer`, playerId => this.removePlayer(playerId));
    //alle players toevoegen als je net joined
    this.socket.on(`addAllPlayers`, players => this.addAllPlayers(players));

    this.socket.on(`playerJoinedRoom`, data => this.playerJoinedRoom(data));

    this.socket.on(`roomFound`, room => this.roomFound(room));
    this.socket.on(`roomNotFound`, room => this.roomNotFound(room));
  }

  initPeer() {
    console.log(`Init die peer`);
  }

  roomFound(room) {
    this.socket.emit(`joinRoom`, room);
    router.transitionTo(`/rooms/${room}`);
  }

  roomNotFound(room) {
    console.log(`Room ${room} werd niet gevonden!`);
  }

  playerJoinedRoom(data) {
    const {player, room, players} = data;
    console.log(`${player} joined room ${room}`);
    this.setState({playersInMyRoom: players});
  }

  addPlayer(player) {
    const {players} = this.state;
    players.push(player);
    this.setState({players});
  }

  removePlayer(playerId) {
    const {players, playersInMyRoom} = this.state;

    const updatedPlayers = players.filter(p => {
      return p.id !== playerId;
    });

    const updatedPlayersInMyRoom = playersInMyRoom.filter(p => {
      return p !== playerId;
    });

    this.setState({
      players: updatedPlayers,
      playersInMyRoom: updatedPlayersInMyRoom
    });
  }

  addAllPlayers(ids) {
    const {players} = this.state;
    ids.forEach(id => {
      players.push(id);
    });
    this.setState({players});
  }

  addRoom(router) {
    this.socket.emit(`createRoom`);
    this.socket.on(`roomCreated`, roomId => {
      const {playersInMyRoom} = this.state;
      playersInMyRoom.push(this.socket.id);
      router.transitionTo(`/rooms/${roomId}`);
    });
  }

  checkRoom(room) {
    this.socket.emit(`checkRoom`, room);
  }

  setRouter(setRouter) {
    router = setRouter;
  }

  render() {

    const {players, playersInMyRoom} = this.state;

    return (
      <Router>
        {({router}) => (
          <main>

            <Match exactly pattern='/' render={() => {
              return (
                <Redirect to={{
                  pathname: `/menu`
                }} />
              );
            }} />

            <Match
              exactly pattern='/menu'
              render={() => (
                <Menu
                  setRouter={this.setRouter(router)}
                  players={players}
                  addRoom={() => this.addRoom(router)}
                  checkRoom={room => this.checkRoom(room)}
                />
              )}
            />

            {/* HOE ID DOORSTUREN VIA THIS.PROPS.PARAMS?? */}
            <Match
              exactly pattern='/rooms/:id'
              render={() => (
                <Room
                  playersInMyRoom={playersInMyRoom}
                />
              )}
            />

            <Match
              exactly pattern='/test'
              component={Test}
            />

            <Match exactly pattern='/*' render={() => {
              return (
                <Redirect to={{
                  pathname: `/menu`
                }} />
              );
            }} />

          </main>
        )}
      </Router>
    );
  }

}

export default App;
