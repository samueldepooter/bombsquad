import React from 'react';

const PassBomb = (props: {time: string, renderFutureBombHolders: () => void}) => {
  return (
    <section className='passbomb givebomb phonewrapper'>

      <header className='globalheader'>
        <div className='screw screwleft'></div>
        <h2>Who deserves the bomb next?</h2>
        <div className='screw screwright'></div>
      </header>


      <div className='bombwrapper'>
        <div className='bombPicture'></div>
        <ul className='bombholders'>
          {props.renderFutureBombHolders()}
        </ul>
      </div>

      <div className='timeLockDisplay'>
        <p className='timeLeft'>Time left</p>
        <p className='timer'>0:{props.time}</p>
      </div>
    </section>
  );
};

export default PassBomb;
