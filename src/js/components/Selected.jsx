import React from 'react';

const Selected = (props: {renderFutureBombHolders: () => void, renderPowerups: () => void, renderError: () => void}) => {
  return (
    <section className='passbomb receivebomb phonewrapper'>

      <header className='globalheader'>
        <div className='screw screwleft'></div>
        <h2>Prepare..., you might receive the bomb!</h2>
        <div className='screw screwright'></div>
      </header>

      <p className='info'>The bombholder is picking a victim...</p>

      <div className='bombwrapper'>
        <div className='bombPicture'></div>
        <ul className='bombholders'>
          {props.renderFutureBombHolders()}
        </ul>
      </div>

      <div className='powerupsWrapper'>
        <p>Powerups:</p>
        {props.renderPowerups()}
      </div>

      {props.renderError()}

    </section>
  );
};

export default Selected;
