//@flow

import React from 'react';

const Winner = (data: {picture: string}) => {

  return (
    <section className='winner phonewrapper'>
      <header className='globalheader'>
        <div className='screw screwleft'></div>
        <div className='titleWinnerWrapper'>
          <div className='winnerBombImage'></div>
          <h2>Congratulations, you're da bomb!</h2>
        </div>
        <div className='screw screwright'></div>
      </header>
      <div className='winnerPicture'>
        <div className='playerPicture' style={{backgroundImage: `url(${data.picture})`}}></div>
        <p>You have won the game, hopefully you placed a bet with your friends!</p>
      </div>

      <div className='menuButtonWrapper'>
        <div className='coolBorder'></div>
        <a className='button' href='/'>Play again</a>
      </div>
    </section>
  );
};

export default Winner;
