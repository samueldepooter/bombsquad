class Timer {

  constructor(io, bombHolder, room, time) {
    this.io = io;
    this.bombHolder = bombHolder;
    this.room = room;
    this.time = time;
  }

  start() {
    const timer = setInterval(() => {

      const data = {
        time: this.time,
        bombHolder: this.bombHolder
      };

      //data doorsturen naar iedereen in de room
      this.io.in(this.room.id).emit(`time`, data);

      if (this.time <= 0) {
        console.log(`Player ${this.bombHolder.id} is dood!`);
        clearInterval(timer);
        return;
      }

      console.log(`Room ${this.room.id} heeft nog ${this.time} seconden over!`);
      this .time--;

    }, 1000);
  }
}

module.exports = Timer;
