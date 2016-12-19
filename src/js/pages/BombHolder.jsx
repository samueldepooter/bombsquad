import React, {Component} from 'react';

type Props = {
  time: number,
}

class BombHolder extends Component {

  props: Props;
  state = {};

  render() {

    const {time} = this.props;

    return (

      <section className='lock'>
        <header className='turnPhone'>
            <div className='phoneIcon'></div>
            <h2>Turn your phone <br /> to unlock the door</h2>
        </header>

        <div className='wheelwrapper'>
          <div className='wheelFront'>
            <div className='status'></div>
          </div>
          <div className='wheelShadow'></div>
        </div>

        <div className='timeLockDisplay'>
          <p className='timeLeft'>Time left:</p>
          <p className='timer'>0:{time}</p>
        </div>


        {/* <div className='totalTime'>
          <div className='currentTime'></div>
        </div> */}

        <div className='screw topleft'></div>
        <div className='screw topright'></div>
        <div className='screw bottomright'></div>
        <div className='screw bottomleft'></div>
      </section>
      // {/* <div>
      //
      //   <p>Time left: {time}</p>
      // </div> */}
    );
  }

}

export default BombHolder;
