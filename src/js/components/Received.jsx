//@flow

import React from 'react';

const Received = (props: {time: number, bombHolder: Object}) => {

  return (
    <section className='passbomb receive phonewrapper'>

      <header className='globalheader'>
        <div className='screw screwleft'></div>
          <h2>You received the bomb from:</h2>
          <div className='bomberwrap'>
            <div className='bomberimage' style={{backgroundImage: `url(${props.bombHolder.picture})`}}></div>
          </div>
        <div className='screw screwright'></div>
      </header>

      <div className='bombPicture'></div>

      <div className='timeLockDisplay'>
        <p className='timeLeft'>There were {props.time} seconds left!</p>
      </div>

    </section>
  );
};

export default Received;
