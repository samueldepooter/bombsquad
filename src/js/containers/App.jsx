//@flow

import React, {Component} from 'react';
import {Match, Redirect} from 'react-router';
import Router from 'react-router/BrowserRouter';
import IO from 'socket.io-client';

import {Menu, Test, TakePicture, Room, Game} from '../pages/';

let router: Object = {};

type state = {
  players: Array<Object>,
  playersInMyRoom: Array<Object>,
  roomId: string,
  myPictureData: string
}

type Player = {
  id: string,
  picture: string,
  room: string
}

class App extends Component {

  state: state = {
    players: [],
    playersInMyRoom: [],
    roomId: ``,
    myPictureData: ``
  }

  socket: Object;

  componentWillMount() {
    this.initSocket();
  }

  initSocket() {
    this.socket = IO(`/`);

    this.socket.on(`connect`, this.initPeer);

    //1 player toevoegen als je reeds gejoined bent en iemand anders joined ook
    this.socket.on(`addPlayer`, player => this.addPlayer(player));
    this.socket.on(`removePlayer`, playerId => this.removePlayerWSHandler(playerId));
    //alle players toevoegen als je net joined
    this.socket.on(`addAllPlayers`, players => this.addAllPlayers(players));

    this.socket.on(`playerJoinedRoom`, data => this.playerJoinedRoomWSHandler(data));

    this.socket.on(`roomFound`, room => this.roomFound(room));
    this.socket.on(`roomNotFound`, room => this.roomNotFound(room));

    this.socket.on(`playerCreatedPicture`, player => this.addPictureToPlayerHandler(player));
  }

  setRouter(setRouter: Object) {
    router = setRouter;
  }

  initPeer() {
    console.log(`Init die peer`);
  }

  addPictureToPlayerHandler(player: Player) {
    const {playersInMyRoom} = this.state;

    const thePlayer = playersInMyRoom.find(p => {
      if (p.id === player.id) return p;
    });

    if (thePlayer) thePlayer.picture = player.picture;

    this.setState({playersInMyRoom});
  }

  roomFound(roomId: string) {
    this.socket.emit(`joinRoom`, roomId);
    this.setState({roomId});
    router.transitionTo(`/rooms/${roomId}/picture`);
  }

  roomNotFound(room: string) {
    console.log(`Room ${room} werd niet gevonden!`);
  }

  playerJoinedRoomWSHandler(data: {player: string, room: string, players: Array<Object>}) {
    const {player, room, players} = data;
    console.log(`${player} joined room ${room}`);
    this.setState({playersInMyRoom: players});
  }

  addPlayer(player: Player) {
    const {players} = this.state;
    players.push(player);
    this.setState({players});
  }

  removePlayerWSHandler(playerId: number) {
    const {players, playersInMyRoom} = this.state;

    const updatedPlayers = players.filter(p => {
      return p.id !== playerId;
    });

    const updatedPlayersInMyRoom = playersInMyRoom.filter(p => {
      return p.id !== playerId;
    });

    this.setState({
      players: updatedPlayers,
      playersInMyRoom: updatedPlayersInMyRoom
    });
  }

  addAllPlayers(allPlayers: Array<Object>) {
    const {players} = this.state;
    allPlayers.forEach(player => {
      players.push(player);
    });
    this.setState({players});
  }

  addRoomHandler() {

    this.socket.emit(`createRoom`);

    this.socket.on(`roomCreated`, ({player, roomId}) => {
      const {playersInMyRoom} = this.state;
      playersInMyRoom.push(player);

      this.setState({roomId});
      router.transitionTo(`/rooms/${roomId}/picture`);
    });

  }

  checkRoom(room: string) {
    this.socket.emit(`checkRoom`, room);
  }

  takePictureHandler(myPictureData: string) {
    const {roomId} = this.state;

    this.setState({myPictureData});

    this.socket.emit(`newPicture`, myPictureData);
    router.transitionTo(`/rooms/${roomId}/wait`);
  }

  startGameHandler() {
    console.log(`socket emitten naar alle players in de room als hier op geklikt wordt om ze in de game state te pushen`);
  }

  render() {

    const {players, playersInMyRoom, roomId, myPictureData} = this.state;

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
                  onAddRoom={() => this.addRoomHandler()}
                  checkRoom={room => this.checkRoom(room)}
                />
              )}
            />

            <Match
              exactly pattern='/rooms/:id/picture'
              render={() => (
                <TakePicture
                  onTakePicture={data => this.takePictureHandler(data)}
                />
              )}
            />

            <Match
              exactly pattern='/rooms/:id/wait'
              render={() => {

                if (!this.socket.id) {

                  return (<Redirect to={{
                    pathname: `/menu`
                  }} />);

                } else {

                  return (<Room
                    roomId={roomId}
                    myId={this.socket.id}
                    playersInMyRoom={playersInMyRoom}
                    myPictureData={myPictureData}
                    onStartGame={() => this.startGameHandler()}
                  />);

                }
              }}
            />

            <Match
              exactly pattern='/rooms/:id/game'
              render={() => (
                <Game />
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

            <Match exactly pattern='/rooms/create' render={() => {
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
