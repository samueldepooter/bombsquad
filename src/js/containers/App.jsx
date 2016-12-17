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
  loading: boolean
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
    loading: true
  }

  socket: Object;

  componentWillMount() {
    this.initSocket();
  }

  initSocket() {
    this.socket = IO(`/`);

    this.socket.on(`connect`, this.initPeer);

    //1 player toevoegen als je reeds gejoined bent en iemand anders joined ook
    this.socket.on(`add`, player => this.addWSHandler(player));
    this.socket.on(`remove`, playerId => this.removeWSHandler(playerId));
    //alle players toevoegen als je net joined
    this.socket.on(`addAll`, players => this.addAllWSHandler(players));

    this.socket.on(`joined`, player => this.joinedWSHandler(player));
    this.socket.on(`getRoomData`, data => this.roomDataWSHandler(data));

    this.socket.on(`found`, room => this.foundWSHandler(room));
    this.socket.on(`notFound`, room => this.notFoundWSHandler(room));

    this.socket.on(`pictureTaken`, player => this.pictureTakenWSHandler(player));
  }

  setRouter(setRouter: Object) {
    router = setRouter;
  }

  initPeer() {
    console.log(`Init die peer`);
  }

  roomDataWSHandler(data: {room: string, players: Array<Player>}) {

    console.log(`data from the whole room because i just joined`);
    console.log(data);

    let {roomId, playersInMyRoom} = this.state;

    roomId = data.room;
    playersInMyRoom = data.players;

    this.setState({roomId, playersInMyRoom});
  }

  pictureTakenWSHandler(player: Player) {
    const {playersInMyRoom} = this.state;

    const thePlayer = playersInMyRoom.find(p => {
      if (p.id === player.id) return p;
    });

    if (thePlayer) thePlayer.picture = player.picture;

    this.setState({playersInMyRoom});
  }

  foundWSHandler(roomId: string) {
    this.socket.emit(`joinRoom`, roomId);
    this.setState({roomId});
    router.transitionTo(`/rooms/${roomId}/picture`);
  }

  notFoundWSHandler(room: string) {
    console.log(`Room ${room} werd niet gevonden!`);
  }

  joinedWSHandler(player: {id: string, picture: string, room: string}) {
    const {roomId, playersInMyRoom} = this.state;

    console.log(`${player.id} joined room ${roomId}`);

    playersInMyRoom.push(player);
    this.setState({playersInMyRoom});
  }

  addWSHandler(player: Player) {
    const {players} = this.state;
    players.push(player);
    this.setState({players});
  }

  removeWSHandler(playerId: number) {
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

  addAllWSHandler(allPlayers: Array<Object>) {
    const {players} = this.state;
    allPlayers.forEach(player => {
      players.push(player);
    });
    this.setState({players, loading: false});
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

  checkRoomHandler(room: string) {
    this.socket.emit(`checkRoom`, room);
  }

  takePictureHandler(myPictureData: string) {
    const {roomId} = this.state;

    this.socket.emit(`newPicture`, myPictureData);
    router.transitionTo(`/rooms/${roomId}/wait`);
  }

  startGameHandler() {
    console.log(`socket emitten naar alle players in de room als hier op geklikt wordt om ze in de game state te pushen`);
    this.socket.emit(`startGame`);
  }

  render() {

    const {players, playersInMyRoom, roomId, loading} = this.state;

    console.log(loading);

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
                  onCheckRoom={room => this.checkRoomHandler(room)}
                  loading={loading}
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

          </main>
        )}
      </Router>
    );
  }

}

export default App;
