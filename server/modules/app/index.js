module.exports.register = (server, options, next) => {

  const io = require(`socket.io`)(server.listener);

  let players = [];
  const codes = [];

  const rooms = io.sockets.adapter.rooms;

  io.on(`connection`, socket => {

    const {id: playerId} = socket;

    const player = {
      id: playerId,
      picture: ``,
      room: ``
    };

    players.push(player);

    //naar iedereen buiten jezelf sturen dat je gejoined bent
    socket.broadcast.emit(`add`, player);

    //naar jezelf alle players die geconnect zijn met de server sturen
    socket.emit(`addAll`, players);

    console.log(`Player with ID: ${player.id} is connected. ${players.length} spelers in totaal`);

    socket.on(`createRoom`, () => {
      let number = Math.floor(Math.random() * 9000) + 1000; //generate random nummer tussen 1000 en 9999

      //tussen alle codes kijken of de gegenereerde code al bestaat
      //als die bestaat -> nieuwe code genereren tot er eentje gemaakt wordt dat nog niet bestaat
      codes.find(code => {
        while (code === number) {
          console.log(`code bestaat al - opnieuw uitvoeren`);
          number = Math.floor(Math.random() * 9000) + 1000;
        }
      });

      //hier weet je zeker dat het nummer nog niet bestaat

      //gegenereed nummer bij de codes steken
      codes.push(number);
      //room joinen
      socket.join(number);

      const data = {
        player: player,
        roomId: number
      };

      //jezelf in de players zoeken
      const me = players.find(p => {
        if (p.id === playerId) return p;
      });

      //jouw room op het gegenereerd nummer zetten
      me.room = number;

      socket.emit(`roomCreated`, data);
    });

    socket.on(`newPicture`, picture => {
      const me = players.find(p => {
        if (p.id === playerId) return p;
      });

      me.picture = picture;

      io.in(me.room).emit(`pictureTaken`, me);
    });

    socket.on(`joinRoom`, room => {
      socket.join(room);

      //de room die je joined opvragen van socket
      const myRoom = io.sockets.adapter.rooms[room];

      const playersInMyRoom = [];

      //elke player (is enkel het id) die in de room zit pushen naar playersInMyRoom array
      Object.keys(myRoom.sockets).forEach(player => {
        console.log(player, `in my room`);
        //dit id zoeken in alle players en dat object pushen naar playersInMyRoom
        players.map(p => {
          if (p.id === player) playersInMyRoom.push(p);
        });
      });

      const me = players.find(p => {
        if (p.id === playerId) return p;
      });

      me.room = room;

      const roomData = {
        room: room,
        players: playersInMyRoom
      };

      //alle data uit de room naar jezelf sturen
      socket.emit(`getRoomData`, roomData);

      //naar iedereen buiten jezelf in de room jouw player object sturen
      socket.broadcast.in(room).emit(`joined`, player);
    });

    socket.on(`checkRoom`, id => {
      if (rooms.hasOwnProperty(id)) {
        socket.emit(`found`, id);
      } else {
        socket.emit(`notFound`, id);
      }
    });

    socket.on(`disconnect`, () => {
      players = players.filter(p => {
        return p.id !== playerId;
      });

      socket.broadcast.emit(`remove`, playerId);
      console.log(`Player[${player.id}] left`);
    });

  });

  next();

};

module.exports.register.attributes = {
  name: `App`,
  version: `0.1.0`
};
