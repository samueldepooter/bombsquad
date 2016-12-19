//@flow

import React, {Component} from 'react';

type Player = {
  id: string,
  picture: string
}

type Props = {
  players: Array<Player>,
  onCheckRoom: () => void,
  onAddRoom: () => void,
  loading: boolean,
  error: string
}

class Menu extends Component {

  state = {
    checkCode: ``
  };

  props: Props;
  code: Object;

  renderPlayers() {

    const {players} = this.props;

    return players.map((player, i) => {
      return (
        <li className='player' key={i}>{player.id}</li>
      );
    });
  }

  submitCode(e: Object) {
    e.preventDefault();
    const {onCheckRoom} = this.props;
    onCheckRoom(this.code.value);
  }

  limitInput() {
    if (this.code.value > 4) {
      this.code.value = this.code.value.slice(0, 4);
    }
    this.setState({checkCode: this.code.value});
  }

  render() {

    const {onAddRoom, loading, error} = this.props;
    const {checkCode} = this.state;

    const loader = document.querySelector(`.loader`);
    if (loader) {
      if (loading) loader.style.display = `flex`;
      else loader.style.display = `none`;
    }


    return (

    <section className='menu phonewrapper'>
      <header className='logoheader'>
        <h2 className='logo'><span className='hidden'>Bomb Squad Logo</span></h2>
      </header>
      <div className='formwrapperMenu'>
        <div>
        <button to={`/rooms/create`} className='button' onClick={() => onAddRoom()}> Create a room</button>
        </div>
        <p className='or'>or</p>
        <form className='menuform' onSubmit={e => this.submitCode(e)}>
          <label htmlFor='code'>Join a room</label>
          <div className='codeinputwrapper'>
            <label htmlFor='code' className='lockicon'></label>
            <input ref={code => this.code = code} onChange={() => this.limitInput()} value={checkCode}className='codeinput' id='code' min='1000' max='9999' size='4' type='number' placeholder='XXXX' />
          </div>
          <p className='error'>{error}</p>
        </form>
      </div>

      <div className='screw topleft'></div>
      <div className='screw topright'></div>
      <div className='screw bottomright'></div>
      <div className='screw bottomleft'></div>
      <div className='bombmenu'></div>
    </section>

      /*
      <div>

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
