module.exports.register = (server, options, next) => {

  const io = require(`socket.io`)(server.listener);

  let players = [];
  const rooms = [];

  const socketRooms = io.sockets.adapter.rooms;

  io.on(`connection`, socket => {

    const {id: playerId} = socket;

    //enkel shield bijhouden per player omdat jammer niet nuttig is om bij te houden, shield wel zodat je kan doorgeven welke speler beschermd is
    const player = {
      id: playerId,
      picture: ``,
      powerups: {
        shield: false
      }
    };

    //enkel jammer bijhouden in room omdat je moet weten of die reeds gebruikt is, 2 jammers tegelijk mag niet
    const room = {
      id: ``,
      started: false,
      jammer: false
    };

    players.push(player);

    //naar iedereen buiten jezelf sturen dat je gejoined bent
    socket.broadcast.emit(`add`, playerId);

    //naar jezelf de lengte van alle players die geconnect zijn met de server sturen
    socket.emit(`addAll`, players.length);

    console.log(`Player with ID: ${player.id} is connected. ${players.length} spelers in totaal`);

    socket.on(`createRoom`, () => {
      let number = generateRandomNumber(1000, 9000);
      room.id = number.toString();

      //tussen alle rooms kijken of de gegenereerde room al bestaat
      //als die bestaat -> nieuwe code genereren tot er eentje gemaakt wordt dat nog niet bestaat
      rooms.find(room => {
        while (room.id === number) {
          console.log(`code bestaat al - opnieuw uitvoeren`);
          number = generateRandomNumber(1000, 9000);
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

    socket.on(`vaultOpen`, () => {

      console.log(`Find 4 random players`);

      const playersInMyRoom = findOtherPlayersInRoom(room, playerId);

      const possibleHolders = [];
      //als er minder dan 4 players nog over zijn, ze allemaal altijd pushen
      let maxPlayers;
      if (playersInMyRoom.length < 4) maxPlayers = playersInMyRoom.length;
      else maxPlayers = 4;

      for (let i = 0;i < maxPlayers;i ++) {
        let randomPlayer;
        randomPlayer = findRandomPlayer(playersInMyRoom);

        possibleHolders.map(possibleHolder => {
          //zolang de randomplayer gelijk is een een possibleholder, opnieuw zoeken naar een randomplayer
          while (randomPlayer.id === possibleHolder.id) {
            console.log(`Waarde was hetzelfde`);
            randomPlayer = findRandomPlayer(playersInMyRoom);
          }
        });

        possibleHolders.push(randomPlayer);
      }

      console.log(`Currently holding the bomb: ${playerId}`);
      console.log(`Possible # holders in room ${room.id}: ${possibleHolders.length}`);

      if (possibleHolders.length === 0) {
        //is nodig voor als de laatste van de 2 wegvalt, dan win je sowieso
        socket.emit(`winner`);
        socket.leave(room.id);
      } else {
        io.in(room.id).emit(`passBomb`, possibleHolders);
      }

    });

    socket.on(`startGame`, () => {
      //room op starten zetten zodat je niet meer kan joinen
      room.started = true;

      const playersInMyRoom = findPlayersInRoom(room);

      //in playersInMyRoom zoeken naar een random player -> deze krijgt de bom
      const bombHolder = findBombHolder(playersInMyRoom);

      //tijd wordt op de client geregeld
      io.in(room.id).emit(`startGame`, bombHolder);

    });

    socket.on(`newBombHolder`, bombHolder => {

      const playersInMyRoom = findPlayersInRoom(room);

      //als playersInMyRoom nog maar 1 speler bevat dan heeft die gewonnen
      if (playersInMyRoom.length === 1) {
        youWin(room);
        return;
      }

      io.in(room.id).emit(`clearTimer`);
      //received versturen naar degene die de bom krijgt
      io.in(bombHolder.id).emit(`received`);
      //given sturen naar degene die de bom net weg heeft gedaan
      socket.emit(`given`, bombHolder);

      //nieuwe bombholder wordt er pas later ingestoken dus oude blijft zitten tot een nieuwe is gekozen
      setTimeout(() => {
        resetJammer(room);
        //tijd opnieuw starten met nieuwe bombHolder na x seconden
        io.in(room.id).emit(`newBombHolder`, bombHolder);
      }, 2000);

    });

    socket.on(`randomBombHolder`, (myRoomId = room.id) => {

      const room = {
        id: myRoomId
      };

      const playersInMyRoom = findPlayersInRoom(room);

      //als playersInMyRoom nog maar 1 speler bevat dan heeft die gewonnen
      if (playersInMyRoom.length === 1) {
        youWin(room);
        return;
      }

      //in playersInMyRoom zoeken naar een random player -> deze krijgt de bom
      const bombHolder = playersInMyRoom[Math.floor(Math.random() * playersInMyRoom.length)];

      //timeout van 3s vooraleer het terug begint
      setTimeout(() => {
        resetJammer(room);
        io.in(myRoomId).emit(`randomBombHolder`, bombHolder);
      }, 2000);

    });

    socket.on(`newPicture`, picture => {
      player.picture = picture;
      io.in(room.id).emit(`pictureTaken`, player);
    });

    socket.on(`join`, id => {

      //hier is de room zeker nog niet gestart -> je mag joinen
      socket.join(id);
      room.id = id;

      const playersInMyRoom = findPlayersInRoom(room);

      const roomData = {
        room: id,
        players: playersInMyRoom
      };

      //alle data uit de room naar jezelf sturen
      socket.emit(`getRoomData`, roomData);

      //naar iedereen buiten jezelf in de room jouw player object sturen
      socket.broadcast.in(id).emit(`joined`, player);
    });

    socket.on(`leave`, id => {

      const leftPlayer = players.find(p => {
        return p.id === id;
      });

      io.in(room.id).emit(`remove`, leftPlayer.id);
      socket.leave(room.id);
    });

    socket.on(`checkRoom`, id => {
      const checkedRoom = rooms.find(r => {
        return r.id === id;
      });

      if (checkedRoom) {

        //checken of de room al niet bezig is en indien het zo is returnen
        if (checkedRoom.started) {
          socket.emit(`busy`, id);
          return;
        }

        //room is nog niet bezig -> logica verder uitvoeren
        socket.emit(`found`, id);
      } else {
        socket.emit(`notFound`, id);
      }

    });

    socket.on(`jammer`, bombHolderId => {
      //room zoeken, checken of er niet al een jammer bezig is, indien niet -> jammer zetten op de room -> emitten naar de bombholder

      const myRoom = rooms.find(r => {
        return r.id === room.id;
      });

      //als die true is dan is de jammer al eens gebruikt deze ronde
      if (myRoom.jammer) {
        socket.emit(`jammerUsed`, false);
        return;
      }

      //hier is die nog niet gebruikt dus op true zetten
      myRoom.jammer = true;
      //naar je eigen emitten dat je het hebt kunnen gebruiken
      socket.emit(`jammerUsed`, true);

      //naar de bombholder emitten dat je hem jammed
      io.in(bombHolderId).emit(`jammed`);

    });

    socket.on(`disconnect`, () => {
      players = players.filter(p => {
        return p.id !== playerId;
      });

      socket.broadcast.emit(`remove`, playerId);
      console.log(`Player[${player.id}] left`);
    });

  });

  const resetJammer = room => {
    const myRoom = rooms.find(r => {return r.id === room.id;});
    myRoom.jammer = false;
  };

  const findPlayersInRoom = room => {

    //eigen room ophalen voor de players te vinden
    const mySocketRoom = socketRooms[room.id];

    const playersInMyRoom = [];

    Object.keys(mySocketRoom.sockets).forEach(player => {
      players.map(p => {
        if (p.id === player) playersInMyRoom.push(p);
      });
    });

    return playersInMyRoom;

  };

  const findBombHolder = playersInMyRoom => {
    return playersInMyRoom[Math.floor(Math.random() * playersInMyRoom.length)];
  };

  const findOtherPlayersInRoom = (room, playerId) => {
    const mySocketRoom = socketRooms[room.id];

    //players uit je room halen
    const playersInMyRoom = [];
    Object.keys(mySocketRoom.sockets).forEach(socketPlayer => {
      players.map(p => {
        //degene die net de bom had er uit filteren
        if (p.id === socketPlayer && p.id !== playerId) playersInMyRoom.push(p);
      });
    });

    return playersInMyRoom;
  };

  const generateRandomNumber = (n1, n2) => {
    return Math.floor(Math.random() * n2) + n1; //generate random nummer tussen 1000 en 9999
  };

  const findRandomPlayer = playersInMyRoom => {
    return playersInMyRoom[Math.floor(Math.random() * playersInMyRoom.length)];
  };

  const youWin = room => {
    io.in(room.id).emit(`winner`);
    return room.id = ``;
  };

  next();

};

module.exports.register.attributes = {
  name: `App`,
  version: `0.1.0`
};
