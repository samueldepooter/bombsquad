//@flow

import React from 'react';

const Dead = () => {
  return (
    <section className='dead phonewrapper'>
      <header className='globalheader'>
        <div className='screw screwleft'></div>
        <h2>Oh no, the bomb exploded! You're out!</h2>
        <div className='screw screwright'></div>
      </header>
      <img className='bangImage' src='assets/images/bang.svg'></img>
      <div className='menuButtonWrapper'>
        <div className='coolBorder'></div>
        <a className='button' href='/'>Menu</a>
      </div>
    </section>
  );
};

export default Dead;
