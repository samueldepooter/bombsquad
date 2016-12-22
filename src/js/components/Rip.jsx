import React from 'react';

const Rip = (props: {bombHolder: Object}) => {
  return (
    <section className='winner rip phonewrapper'>
      <header className='globalheader'>
        <div className='screw screwleft'></div>
        <div className='titleWinnerWrapper'>
          <div className='winnerBombImage'></div>
          <h2>RIP</h2>
        </div>
        <div className='screw screwright'></div>
      </header>
      <div className='winnerPicture'>
        <div className='playerPicture' style={{backgroundImage: `url(${props.bombHolder.picture})`}}></div>
        <p>This person exploded into a million pieces! <br /> Prepare yourself, it's time for a new victim!</p>
      </div>
    </section>
  );
};

export default Rip;
