import React from 'react';

const Rip = (props: {bombHolder: Object}) => {
  return (
    <section className='winner rip phonewrapper'>
      <header className='globalheader'>
        <div className='screw screwleft'></div>
        <div className='titleWinnerWrapper'>
          <div className='winnerBombImage'></div>
          <h2>R.I.P</h2>
        </div>
        <div className='screw screwright'></div>
      </header>
      <div className='winnerPicture'>
        <div className='playerPicture' style={{backgroundImage: `url(${props.bombHolder.picture})`}}></div>
        <p>Another one bites the dust! Time for a new victim!</p>
      </div>
    </section>
  );
};

export default Rip;
