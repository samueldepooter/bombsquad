import React from 'react';

const Given = (props: {time: number, newBombHolder: Object}) => {
  return (
    <section className='passbomb receive phonewrapper'>

      <header className='globalheader'>
        <div className='screw screwleft'></div>
          <h2>You handed the bomb over to:</h2>
          <div className='bomberwrap'>
            <div className='bomberimage' style={{backgroundImage: `url(${props.newBombHolder.picture})`}}></div>
          </div>
        <div className='screw screwright'></div>
      </header>

      <div className='bombPicture'></div>

      <div className='timeLockDisplay'>
        <p className='timeLeft'>You had {props.time} seconds left!</p>
      </div>

    </section>
  );
};

export default Given;
