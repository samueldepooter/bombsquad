//@flow

import React, {Component} from 'react';
import {Match, Redirect} from 'react-router';
import Router from 'react-router/BrowserRouter';
import IO from 'socket.io-client';

import {
  Menu,
  TakePicture,
  Room,
  BombHolder,
  Spectator
} from '../pages/';

let router: Object = {};

type Player = {
  id: string,
  picture: string,
  room: string
}

type state = {
  players: Array<Player>,
  playersInMyRoom: Array<Player>,
  room: string,
  bombHolder: string,
  loading: boolean
}

class App extends Component {

  state: state = {
    players: [],
    playersInMyRoom: [],
    room: ``,
    bombHolder: ``,
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

    this.socket.on(`found`, id => this.foundWSHandler(id));
    this.socket.on(`notFound`, id => this.notFoundWSHandler(id));
    this.socket.on(`busy`, id => this.busyWSHandler(id));

    this.socket.on(`pictureTaken`, player => this.pictureTakenWSHandler(player));
    this.socket.on(`startGame`, bombHolder => this.startGameWSHandler(bombHolder));
  }

  setRouter(setRouter: Object) {
    router = setRouter;
  }

  initPeer() {
    console.log(`Init die peer`);
  }

  busyWSHandler(id: string) {
    console.log(`Room ${id} is al bezig met spelen`);
  }

  startGameWSHandler(bombHolder: string) {
    const {room} = this.state;
    this.setState({bombHolder});
    router.transitionTo(`/rooms/${room}/game`);
  }

  roomDataWSHandler(data: {room: string, players: Array<Player>}) {

    console.log(`data from the whole room because i just joined`);

    let {room, playersInMyRoom} = this.state;

    room = data.room;
    playersInMyRoom = data.players;

    this.setState({room, playersInMyRoom});
  }

  pictureTakenWSHandler(player: Player) {
    const {playersInMyRoom} = this.state;

    const thePlayer = playersInMyRoom.find(p => {
      if (p.id === player.id) return p;
    });

    if (thePlayer) thePlayer.picture = player.picture;

    this.setState({playersInMyRoom});
  }

  foundWSHandler(id: string) {
    this.socket.emit(`joinRoom`, id);

    let {room} = this.state;
    room = id;
    this.setState({room});

    router.transitionTo(`/rooms/${id}/picture`);
  }

  notFoundWSHandler(id: string) {
    console.log(`Room ${id} werd niet gevonden!`);
  }

  joinedWSHandler(player: {id: string, picture: string, room: string}) {
    const {room, playersInMyRoom} = this.state;

    console.log(`${player.id} joined room ${room}`);

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

    this.socket.on(`roomCreated`, ({player, room}) => {
      const {playersInMyRoom} = this.state;
      playersInMyRoom.push(player);

      this.setState({room});
      router.transitionTo(`/rooms/${room}/picture`);
    });

  }

  checkRoomHandler(id: string) {
    this.socket.emit(`checkRoom`, id);
  }

  takePictureHandler(myPictureData: string) {
    const {room} = this.state;
    this.socket.emit(`newPicture`, myPictureData);
    router.transitionTo(`/rooms/${room}/wait`);
  }

  startGameHandler() {
    const {room} = this.state;
    this.socket.emit(`startGame`, room);
  }

  render() {

    const {players, playersInMyRoom, room, loading} = this.state;

    console.log(room);

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
                  onCheckRoom={id => this.checkRoomHandler(id)}
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
                    room={room}
                    myId={this.socket.id}
                    playersInMyRoom={playersInMyRoom}
                    onStartGame={() => this.startGameHandler()}
                  />);

                }
              }}
            />

            <Match
              exactly pattern='/rooms/:id/game'
              render={() => {

                const {bombHolder} = this.state;

                if (bombHolder === this.socket.id) {
                  return (<BombHolder />);
                } else {
                  return (<Spectator />);
                }
              }}
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
