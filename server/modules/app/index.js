module.exports.register = (server, options, next) => {

  const io = require(`socket.io`)(server.listener);

  let players = [];
  const rooms = [];

  const socketRooms = io.sockets.adapter.rooms;

  io.on(`connection`, socket => {

    const {id: playerId} = socket;

    const player = {
      id: playerId,
      picture: ``
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

      socket.emit(`roomCreated`, data);
    });

    socket.on(`vaultOpen`, playerId => {

      console.log(`${playerId} succesfully opened the vault`);
      console.log(`Find 4 random players`);

      const mySocketRoom = socketRooms[room.id];

      //players uit je room halen
      const playersInMyRoom = [];
      Object.keys(mySocketRoom.sockets).forEach(socketPlayer => {
        players.map(p => {
          //degene die net de bom had er uit filteren
          if (p.id === socketPlayer && p.id !== playerId) playersInMyRoom.push(p);
        });
      });

      const possibleHolders = [];
      //als er minder dan 4 players nog over zijn, ze allemaal altijd pushen
      let maxPlayers;
      if (playersInMyRoom.length < 4) maxPlayers = playersInMyRoom.length;
      else maxPlayers = 4;

      for (let i = 0;i < maxPlayers;i ++) {
        let randomPlayer;
        randomPlayer = playersInMyRoom[Math.floor(Math.random() * playersInMyRoom.length)];

        possibleHolders.map(possibleHolder => {
          //zolang de randomplayer gelijk is een een possibleholder, opnieuw zoeken naar een randomplayer
          while (randomPlayer.id === possibleHolder.id) {
            console.log(`Waarde was hetzelfde`);
            randomPlayer = playersInMyRoom[Math.floor(Math.random() * playersInMyRoom.length)];
          }
        });

        possibleHolders.push(randomPlayer);
      }

      console.log(`Currently holding the bomb: ${playerId}`);
      console.log(`Possible # holders in room ${room.id}: ${possibleHolders.length}`);

      if (possibleHolders.length === 0) {
        //is nodig voor als de laatste van de 2 wegvalt, dan win je sowieso
        socket.emit(`winner`);
      } else {
        io.in(room.id).emit(`passBomb`, possibleHolders);
      }

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

      //tijd wordt op de client geregeld
      io.in(room.id).emit(`startGame`, bombHolder);

    });

    socket.on(`newBombHolder`, bombHolder => {

      //eigen room ophalen voor de players te vinden
      const mySocketRoom = socketRooms[room.id];

      const playersInMyRoom = [];
      Object.keys(mySocketRoom.sockets).forEach(player => {
        players.map(p => {
          if (p.id === player) playersInMyRoom.push(p);
        });
      });

      //als playersInMyRoom nog maar 1 speler bevat dan heeft die gewonnen
      if (playersInMyRoom.length === 1) {
        console.log(`${playersInMyRoom[0].id} wins!`);
        io.in(room.id).emit(`clearTimer`);
        io.in(room.id).emit(`winner`);
        room.id = ``;
        return;
      }

      io.in(room.id).emit(`clearTimer`);
      //received versturen naar degene die de bom krijgt
      io.in(bombHolder.id).emit(`received`);
      //given sturen naar degene die de bom net weg heeft gedaan
      socket.emit(`given`, bombHolder);

      //nieuwe bombholder wordt er pas later ingestoken dus oude blijft zitten tot een nieuwe is gekozen
      setTimeout(() => {
        //tijd opnieuw starten met nieuwe bombHolder na x seconden
        io.in(room.id).emit(`newBombHolder`, bombHolder);
      }, 1500);

    });

    socket.on(`randomBombHolder`, (myRoom = room.id) => {

      //eigen room ophalen voor de players te vinden
      //deze handler wordt ook gebruikt voor als je dood bent en dan kent die room.id niet meer
      //dus die geef ik mee via myRoom, in de andere keren dat ik randomBombHolder gebruik wordt myRoom niet ingevuld dus standaard op room.id zetten
      const mySocketRoom = socketRooms[myRoom];

      const playersInMyRoom = [];
      Object.keys(mySocketRoom.sockets).forEach(player => {
        players.map(p => {
          if (p.id === player) playersInMyRoom.push(p);
        });
      });

      //als playersInMyRoom nog maar 1 speler bevat dan heeft die gewonnen
      if (playersInMyRoom.length === 1) {
        console.log(`${playersInMyRoom[0].id} wins!`);
        io.in(myRoom).emit(`winner`);
        room.id = ``;
        return;
      }

      //in playersInMyRoom zoeken naar een random player -> deze krijgt de bom
      const bombHolder = playersInMyRoom[Math.floor(Math.random() * playersInMyRoom.length)];

      //timeout van 3s vooraleer het terug begint
      setTimeout(() => {
        io.in(myRoom).emit(`randomBombHolder`, bombHolder);
      }, 1500);

    });

    socket.on(`newPicture`, picture => {
      player.picture = picture;
      io.in(room.id).emit(`pictureTaken`, player);
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
      room.id = id;

      const roomData = {
        room: id,
        players: playersInMyRoom
      };

      //alle data uit de room naar jezelf sturen
      socket.emit(`getRoomData`, roomData);

      //naar iedereen buiten jezelf in de room jouw player object sturen
      socket.broadcast.in(id).emit(`joined`, player);
    });

    socket.on(`leave`, () => {
      socket.leave(room.id);
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
