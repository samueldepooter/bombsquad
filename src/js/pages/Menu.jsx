//@flow

import React, {Component} from 'react';

type Props = {
  players: number,
  onCheckRoom: () => void,
  onAddRoom: () => void,
  loading: boolean,
  error: string
}

class Menu extends Component {

  props: Props;
  code: Object;

  submitCode(e: Object) {
    e.preventDefault();
    const {onCheckRoom} = this.props;
    onCheckRoom(this.code.value);
  }

  render() {

    const {onAddRoom, error, players} = this.props;

    return (

    <section className='menu phonewrapper'>
      <div className='loader'>One moment... fetching all those bombers</div>
      <header className='logoheader'>
        <h1 className='logo'><span className='hidden'>bomb squad</span></h1>
      </header>
      <section className='formwrapperMenu'>
        <div>
        <button to={`/rooms/create`} className='button' onClick={() => onAddRoom()}> Create a room</button>
        </div>
        <p className='or'>or</p>
        <form className='menuform' onSubmit={e => this.submitCode(e)}>
          <label htmlFor='code'>Join a room</label>
          <div className='codeinputwrapper'>
            <label htmlFor='code' className='lockicon'></label>
            <input ref={code => this.code = code} className='codeinput' name='code' type='text' placeholder='XXXX' />
            <p className='error'>{error}</p>
          </div>
        </form>
      </section>

      <div className='screw topleft'></div>
      <div className='screw topright'></div>
      <div className='screw bottomright'></div>
      <div className='screw bottomleft'></div>
      <div className='bombmenu'></div>
    </section>

      /*
      <div>

<<<<<<< HEAD
        <div className='loader'>One moment... fetching all those bombers</div>


=======
>>>>>>> 93dd1d9a34b8f5a0e9ba73f3e5616da3def77943
        <header>
          <h1 className='title'>Bomb Squad</h1>
        </header>

        <button className='btn' onClick={() => onAddRoom()}>Add room</button>

        <form onSubmit={e => this.submitCode(e)}>
          <label htmlFor='code'>Typ je code in</label>
          <input ref={code => this.code = code} type='text' placeholder='code van de room' />
        </form>

        <p>Players online: {players}</p>


        <p className='error'>{error}</p>
      </div>*/
    );
  }
}

export default Menu;
