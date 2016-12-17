module.exports.register = (server, options, next) => {

  const io = require(`socket.io`)(server.listener);

  let players = [];
  const rooms = [];

  const socketRooms = io.sockets.adapter.rooms;

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

      //tussen alle rooms kijken of de gegenereerde room al bestaat
      //als die bestaat -> nieuwe code genereren tot er eentje gemaakt wordt dat nog niet bestaat
      rooms.find(room => {
        while (room.id === number) {
          console.log(`code bestaat al - opnieuw uitvoeren`);
          number = Math.floor(Math.random() * 9000) + 1000;
        }
      });

      const room = {
        id: number.toString(),
        started: false
      };

      //gegenereede room bij de rooms steken
      rooms.push(room);

      //room joinen
      socket.join(number);

      const data = {
        player: player,
        room: room.id
      };

      //jezelf in de players zoeken
      const me = players.find(p => {
        if (p.id === playerId) return p;
      });

      //jouw room op het gegenereerd nummer zetten
      me.room = number;

      socket.emit(`roomCreated`, data);
    });

    socket.on(`startGame`, id => {

      //room op starten zetten zodat je niet meer kan joinen
      const myRoom = rooms.find(room => {
        return room.id = id;
      });

      myRoom.started = true;

      //eigen room ophalen voor de players te vinden
      const mySocketRoom = socketRooms[id];
      const playersInMyRoom = [];
      Object.keys(mySocketRoom.sockets).forEach(player => {
        players.map(p => {
          if (p.id === player) playersInMyRoom.push(p);
        });
      });

      //in playersInMyRoom zoeken naar een random player -> deze krijgt de bom
      const bombHolder = playersInMyRoom[Math.floor(Math.random() * playersInMyRoom.length)].id;
      io.in(id).emit(`startGame`, bombHolder);
    });

    socket.on(`newPicture`, picture => {
      const me = players.find(p => {
        if (p.id === playerId) return p;
      });

      me.picture = picture;

      io.in(me.room).emit(`pictureTaken`, me);
    });

    socket.on(`joinRoom`, id => {

      //hier is de room zeker nog niet gestart -> je mag joinen
      socket.join(id);

      //de room die je joined opvragen van socket
      const mySocketRoom = socketRooms[id];

      const playersInMyRoom = [];

      //elke player (is enkel het id) die in de room zit pushen naar playersInMyRoom array
      Object.keys(mySocketRoom.sockets).forEach(player => {
        console.log(player, `in my room`);
        //dit id zoeken in alle players en dat object pushen naar playersInMyRoom
        players.map(p => {
          if (p.id === player) playersInMyRoom.push(p);
        });
      });

      const me = players.find(p => {
        if (p.id === playerId) return p;
      });

      me.room = id;

      const roomData = {
        room: id,
        players: playersInMyRoom
      };

      //alle data uit de room naar jezelf sturen
      socket.emit(`getRoomData`, roomData);

      //naar iedereen buiten jezelf in de room jouw player object sturen
      socket.broadcast.in(id).emit(`joined`, player);
    });

    socket.on(`checkRoom`, id => {
      const theRoom = rooms.find(room => {
        return room.id === id;
      });

      if (theRoom) {

        //room zoeken in de rooms array
        const myRoom = rooms.find(room => {
          return room.id === id;
        });

        //checken of de room al niet bezig is en indien het zo is returnen
        if (myRoom.started) {
          socket.emit(`busy`, id);
          return;
        }

        //room is nog niet bezig -> logica verder uitvoeren
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
