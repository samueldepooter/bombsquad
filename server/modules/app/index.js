const Timer = require(`./Timer`);

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

    const room = {
      id: ``,
      started: false,
      timer: 0
    };

    players.push(player);

    //naar iedereen buiten jezelf sturen dat je gejoined bent
    socket.broadcast.emit(`add`, playerId);

    //naar jezelf de lengte van alle players die geconnect zijn met de server sturen
    socket.emit(`addAll`, players.length);

    console.log(`Player with ID: ${player.id} is connected. ${players.length} spelers in totaal`);

    socket.on(`createRoom`, () => {
      let number = Math.floor(Math.random() * 9000) + 1000; //generate random nummer tussen 1000 en 9999
      room.id = number.toString();

      //tussen alle rooms kijken of de gegenereerde room al bestaat
      //als die bestaat -> nieuwe code genereren tot er eentje gemaakt wordt dat nog niet bestaat
      rooms.find(room => {
        while (room.id === number) {
          console.log(`code bestaat al - opnieuw uitvoeren`);
          number = Math.floor(Math.random() * 9000) + 1000;
        }
      });

      //gegenereede room bij de rooms steken
      rooms.push(room);

      //room joinen
      socket.join(number);

      const data = {
        player: player,
        room: room.id
      };

      //jouw room op het gegenereerd nummer zetten
      player.room = number;

      socket.emit(`roomCreated`, data);
    });

    socket.on(`next`, data => {
      //nieuwe bombHolder zoeken

      const room = {
        id: data.room
      };

      //als je dood bent, jezelf uit de room verwijderen
      if (data.dead) socket.leave(data.room);

      //eigen room ophalen voor de players te vinden
      const mySocketRoom = socketRooms[data.room];
      //als je als laatste leaved dan bestaat de socketroom niet meer, kan gebeuren als 1 vd 2 laatste players wegvalt
      if (!mySocketRoom) return;

      const playersInMyRoom = [];
      Object.keys(mySocketRoom.sockets).forEach(socketPlayer => {
        players.map(p => {
          if (p.id === socketPlayer) playersInMyRoom.push(p);
        });
      });

      //als playersInMyRoom nog maar 1 speler bevat dan heeft die gewonnen
      if (playersInMyRoom.length === 1) {
        console.log(`${playersInMyRoom[0].id} wins!`);
        io.in(data.room).emit(`winner`);
        return;
      }

      //in playersInMyRoom zoeken naar een random player -> deze krijgt de bom
      const bombHolder = playersInMyRoom[Math.floor(Math.random() * playersInMyRoom.length)];

      //timeout van 3s vooraleer het terug begint
      setTimeout(() => {
        //tijd aanmaken voor de room en degene die met de bom start meegeven
        const time = 5;
        const timer = new Timer(io, bombHolder, room, time);
        //tijd starten
        timer.start();
        io.in(data.room).emit(`startGame`, {bombHolder, time});
      }, 3000);


    });

    socket.on(`startGame`, () => {

      //room op starten zetten zodat je niet meer kan joinen
      room.started = true;

      //eigen room ophalen voor de players te vinden
      const mySocketRoom = socketRooms[room.id];
      const playersInMyRoom = [];
      Object.keys(mySocketRoom.sockets).forEach(player => {
        players.map(p => {
          if (p.id === player) playersInMyRoom.push(p);
        });
      });

      //in playersInMyRoom zoeken naar een random player -> deze krijgt de bom
      const bombHolder = playersInMyRoom[Math.floor(Math.random() * playersInMyRoom.length)];

      //tijd aanmaken voor de room en degene die met de bom start meegeven
      const time = 1000;
      const timer = new Timer(io, bombHolder, room, time);
      //tijd starten
      timer.start();

      io.in(room.id).emit(`startGame`, {bombHolder, time});
    });

    socket.on(`newPicture`, picture => {
      player.picture = picture;
      io.in(player.room).emit(`pictureTaken`, player);
    });

    socket.on(`join`, id => {

      //hier is de room zeker nog niet gestart -> je mag joinen
      socket.join(id);

      //de room die je joined opvragen van socket om players te weten te komen
      const mySocketRoom = socketRooms[id];

      //lege array om alle players in te steken
      const playersInMyRoom = [];

      //elke player (is enkel het id) die in de room zit pushen naar playersInMyRoom array
      Object.keys(mySocketRoom.sockets).forEach(player => {
        console.log(player, `in my room`);
        //dit id zoeken in alle players en dat object pushen naar playersInMyRoom
        players.map(p => {
          if (p.id === player) playersInMyRoom.push(p);
        });
      });

      //eigen room zetten naar het id dat je gejoined bent
      player.room = id;

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

        //checken of de room al niet bezig is en indien het zo is returnen
        if (theRoom.started) {
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
