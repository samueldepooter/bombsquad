//@flow

import React, {Component} from 'react';
import {Match, Redirect} from 'react-router';
import Router from 'react-router/BrowserRouter';
import IO from 'socket.io-client';
//import Tone from 'tone';

const timerTime = 5;
const waitTime = 2000;

import {
  Menu,
  TakePicture,
  Room,
  BombHolder,
  Spectator,
  Dead,
  Winner,
  Rotation
} from '../pages/';

let router: Object = {};

type Player = {
  id: string,
  picture: string
}

type Powerups = {
  jammer: boolean,
  shield: boolean
}

type state = {
  players: number,
  playersInMyRoom: Array<Player>,
  possibleHolders: Array<Player>,
  room: string,
  bombHolder: Object,
  newBombHolder: Object,
  picture: string,
  powerups: Powerups,
  time: number,
  dead: boolean,
  error: string,
  winner: boolean,
  received: boolean,
  given: boolean
}

class App extends Component {

  state: state = {
    players: 0,
    playersInMyRoom: [],
    possibleHolders: [],
    room: ``,
    picture: ``,
    powerups: {
      shield: false,
      jammer: false
    },
    bombHolder: {},
    newBombHolder: {},
    time: timerTime,
    dead: false,
    error: ``,
    winner: false,
    received: false,
    given: false
  }

  socket: Object

  componentWillMount() {
    this.initSocket();
  }

  initSocket() {
    this.socket = IO(`/`);

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
    this.socket.on(`startGame`, data => this.startGameWSHandler(data));

    this.socket.on(`randomBombHolder`, data => this.setBombHolderWSHandler(data));
    this.socket.on(`newBombHolder`, data => this.setBombHolderWSHandler(data));
    this.socket.on(`winner`, () => this.winnerWSHandler());
    this.socket.on(`passBomb`, possibleHolders => this.passBombWSHandler(possibleHolders));
    this.socket.on(`received`, time => this.receivedWSHandler(time));
    this.socket.on(`given`, to => this.givenWSHandler(to));
    this.socket.on(`clearTimer`, () => this.clearTimer());
    this.socket.on(`jammerUsed`, status => this.jammerUsedWSHandler(status));
    this.socket.on(`jammed`, () => this.jammedWSHandler());
  }

  setRouter(setRouter: Object) {
    router = setRouter;
  }

  jammedWSHandler() {
    console.log(`You have been jammed!`);






    //hier fucken met het geluid
  }

  jammerUsedWSHandler(status: boolean) {
    let {error} = this.state;

    //je hebt de jammer kunnen gebruiken
    if (status) {

      error = `You jam the bombholder!`;

      //jammer resetten
      const {powerups} = this.state;
      powerups.jammer = false;
      this.setState({powerups, error});

      setTimeout(() => this.setState({error: ``}), 1500);

    } else {

      error = `A jammer is already being used!`;
      this.setState({error});

      setTimeout(() => this.setState({error: ``}), 1500);

    }
  }

  givenWSHandler(to: Player) {
    this.setState({
      given: true,
      newBombHolder: to
    });
  }

  receivedWSHandler() {
    this.setState({received: true});
  }

  passBombWSHandler(possibleHolders: Array<Player>) {
    this.setState({possibleHolders});
  }

  winnerWSHandler() {
    let {winner} = this.state;
    winner = true;

    this.setState({winner});
    router.transitionTo(`/winner`);
  }

  busyWSHandler(id: string) {
    let {error} = this.state;
    error = `Room ${id} is already playing :(`;

    this.setState({error});
  }

  startGameWSHandler(bombHolder: Object) {
    const {room} = this.state;

    this.startTimer(bombHolder);

    this.setState({
      bombHolder,
      time: timerTime
    });
    router.transitionTo(`/rooms/${room}/game`);
  }

  startTimer(bombHolder: Player) {

    let {time, dead} = this.state;
    const {room, playersInMyRoom} = this.state;

    time = timerTime;

    this.timer = setInterval(() => {

      //jij hebt de bom
      if (bombHolder.id === this.socket.id) {

        //als je tijd op is ben je zelf dood
        if (time <= 0) {
          dead = true;
          this.setState({dead});

          //jezelf uit de room verwijderen
          this.socket.emit(`leave`, this.socket.id);
          //nieuwe random bombholder zoeken
          if (playersInMyRoom.length !== 2) {
            this.socket.emit(`randomBombHolder`, room);
          }

          router.transitionTo(`/dead`);
        }

      } else {

        if (time <= 0) {
          //als time over is, je hebt de bom niet en er zijn nog 2 spelers over, dan moet jij wel gewonnen hebben
          if (playersInMyRoom.length === 2) {
            //2s wachten tot winner getoond wordt zodat je het RIP scherm kunt zien
            setTimeout(() => {
              this.setState({winner: true});
              router.transitionTo(`/winner`);
            }, waitTime);
            return;
          }
        }

        //jij hebt niet de bom
        console.log(time, `Currently holding the bomb: ${bombHolder.id}`);

      }

      //als tijd = 0 dan is er iemand dood en moet de timer reset worden
      if (time <= 0) {
        console.log(`Player ${bombHolder.id} is dood!`);
        clearInterval(this.timer);
        setTimeout(() => {
          this.setState({time: 0});
          this.clearTimer();
        }, waitTime);
        return;
      }

      //tijd is nog niet 0 dus aftrekken en opnieuw setten
      time --;
      this.setState({time});
      console.log(`You have ${time} seconds left!`);

    }, 1000);

  }

  clearTimer() {
    //interval clearen
    clearInterval(this.timer);
  }

  setBombHolderWSHandler(bombHolder: Object) {

    this.startTimer(bombHolder);

    console.log(`New bomb holder = ${bombHolder.id}`);

    this.setState({
      possibleHolders: [],
      bombHolder: bombHolder,
      time: timerTime,
      received: false,
      given: false
    });

  }

  roomDataWSHandler(data: {room: string, players: Array<Player>}) {
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
    this.socket.emit(`join`, id);

    let {room} = this.state;
    room = id;
    this.setState({room});

    router.transitionTo(`/rooms/${id}/picture`);
  }

  notFoundWSHandler(id: string) {
    let {error} = this.state;
    error = `Room ${id} was not found :(`;
    this.setState({error});

    setTimeout(() => {
      this.setState({error: ``});
    }, 2000);
  }

  joinedWSHandler(player: {id: string, picture: string, room: string}) {
    const {room, playersInMyRoom} = this.state;

    console.log(`${player.id} joined room ${room}`);

    playersInMyRoom.push(player);
    this.setState({playersInMyRoom});
  }

  addWSHandler(playerId: number) {
    let {players} = this.state;
    players ++;

    this.setState({players});

    console.log(`Player [${playerId}] joined`);
  }

  removeWSHandler(playerId: number) {
    const {playersInMyRoom, possibleHolders} = this.state;
    let {players} = this.state;

    players --;

    const updatedPlayersInMyRoom = playersInMyRoom.filter(p => {
      return p.id !== playerId;
    });

    console.log(`Player [${playerId}] left`);

    //player verwijderen uit possibleHolders, kan dat die er op dat moment in zat
    const updatedPossibleHolders = possibleHolders.filter(p => {
      return p.id !== playerId;
    });

    this.setState({
      players,
      playersInMyRoom: updatedPlayersInMyRoom,
      possibleHolders: updatedPossibleHolders
    });

  }

  addAllWSHandler(allPlayers: number) {
    this.setState({players: allPlayers});
    console.log(`Total players: ${allPlayers}`);
  }

  launchIntoFullscreen(element: Object) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  addRoomHandler() {

    //const elem = document.body; // Make the body go full screen.
    //this.launchIntoFullscreen(elem);

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

    this.setState({picture: myPictureData});

    router.transitionTo(`/rooms/${room}/wait`);
  }

  startGameHandler() {
    this.socket.emit(`startGame`);
  }

  openVaultHandler() {
    this.socket.emit(`vaultOpen`);
  }

  passBombHandler(e: Object, player: Player) {

    e.preventDefault();

    const {powerups, time} = this.state;

    //pass je in sneller dan 10s, dan krijg je een jammer
    const checkTime = timerTime - time;
    if (checkTime <= 10) {
      powerups.jammer = true;
      this.setState({powerups: powerups});
    }

    this.clearTimer();

    setTimeout(() => {
      this.setState({possibleHolders: []});
    }, 250);

    this.socket.emit(`newBombHolder`, player);
  }

  shieldClickHandler(e: Object) {

    e.preventDefault();

    //checken of je wel een shield hebt
    const {powerups} = this.state;
    if (!powerups.shield) return;

    console.log(`Use the shield`);
    //logica verplaatsen naar server:
    //signaal emitten -> checken of er niet al een jammer is -> terugsturen of je het hebt kunnen gebruiken -> juiste css renderen
    powerups.shield = false;
    this.setState({powerups});
  }

  soundClickHandler(e: Object) {

    e.preventDefault();

    //checken of je wel een shield hebt
    const {powerups, bombHolder} = this.state;
    if (!powerups.jammer) return;

    console.log(`Use the jammer`);
    this.socket.emit(`jammer`, bombHolder.id);
  }

  render() {

    const {players, playersInMyRoom, room, error, time} = this.state;

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
                  error={error}
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
                const {bombHolder, newBombHolder, possibleHolders, received, given, powerups} = this.state;
                if (bombHolder.id === this.socket.id) {
                  return (<BombHolder
                    time={time}
                    onOpenVault={() => this.openVaultHandler()}
                    onPassBomb={(e, player) => this.passBombHandler(e, player)}
                    possibleHolders={possibleHolders}
                    given={given}
                    newBombHolder={newBombHolder}
                  />);
                } else {
                  return (<Spectator
                    bombHolder={bombHolder}
                    time={time}
                    possibleHolders={possibleHolders}
                    id={this.socket.id}
                    received={received}
                    powerups={powerups}
                    onSoundClick={e => this.soundClickHandler(e)}
                    onShieldClick={e => this.shieldClickHandler(e)}
                    error={error}
                  />);
                }
              }}
            />
            <Match
              exactly pattern='/dead'
              render={() => {
                const {dead} = this.state;
                if (dead) {
                  return (<Dead />);
                } else {
                  return (
                    <Redirect to={{
                      pathname: `/menu`
                    }} />
                  );
                }
              }}
            />
            <Match
              exactly pattern='/winner'
              render={() => {
                //check doen nog op players in my room
                const {winner, picture} = this.state;
                if (winner) {
                  return (<Winner
                    /* winner is nog niet op tijd bepaald dus die blijft leeg voor ong een seconde */
                    picture={picture}
                  />);
                } else {
                  return (
                    <Redirect to={{
                      pathname: `/menu`
                    }} />
                  );
                }
              }}
            />
            <Match
              exactly pattern='/rotation'
              render={() => {
                return (<Rotation />);
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
