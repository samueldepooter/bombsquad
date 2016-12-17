import React, {Component} from 'react';

type Props = {
  time: number
}

class BombHolder extends Component {

  props: Props;
  state = {};

  render() {

    const {time} = this.props;

    return (
      <div>
        <p>Turn your phone to unlock the door</p>
        <p>Time left: {time}</p>
      </div>
    );
  }

}

export default BombHolder;
