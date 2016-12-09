module.exports.register = (server, options, next) => {

  const io = require(`socket.io`)(server.listener);

  let players = [];

  const rooms = io.sockets.adapter.rooms;

  io.on(`connection`, socket => {

    const {id: playerId} = socket;

    const player = {
      id: playerId,
      picture: ``
    };

    players.push(player);

    //naar iedereen buiten jezelf sturen dat je gejoined bent
    socket.broadcast.emit(`addPlayer`, player);

    //naar jezelf alle players die geconnect zijn met de server sturen
    socket.emit(`addAllPlayers`, players);

    console.log(`Player with ID: ${player.id} is connected. ${players.length} spelers in totaal`);
    console.log(players);

    socket.on(`createRoom`, () => {
      const code = Math.floor(Math.random() * 9000) + 1000; //generate random nummer tussen 1000 en 9999

      socket.join(code);

      socket.emit(`roomCreated`, code);
    });

    socket.on(`joinRoom`, room => {
      socket.join(room);

      const players = [];

      //de room die je joined opvragen van socket
      const myRoom = io.sockets.adapter.rooms[room];

      //elke player die in de room zit pushen naar players array
      Object.keys(myRoom.sockets).forEach(player => {
        players.push(player);
      });

      const data = {
        player: playerId,
        room: room,
        players: players
      };

      //naar iedereen in de room sturen dat je gejoined bent
      io.in(room).emit(`playerJoinedRoom`, data);
    });

    socket.on(`leaveRoom`, room => {
      socket.leave(room);
    });


    socket.on(`checkRoom`, id => {

      console.log(rooms);

      if (rooms.hasOwnProperty(id)) {
        //room gevonden
        socket.emit(`roomFound`, id);
      } else {
        //room niet gevonden
        socket.emit(`roomNotFound`, id);
      }
    });

    socket.on(`disconnect`, () => {

      players = players.filter(p => {
        return p.id !== playerId;
      });

      socket.broadcast.emit(`removePlayer`, playerId);

      console.log(`Player[${player.id}] left`);
      console.log(players);

    });

  });

  next();

};

module.exports.register.attributes = {
  name: `App`,
  version: `0.1.0`
};
