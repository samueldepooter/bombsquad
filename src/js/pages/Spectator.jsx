import React, {Component} from 'react';

type Props = {
  time: number,
  bombHolder: Object
}

class Spectator extends Component {

  props: Props
  state = {};

  render() {

    const {time, bombHolder} = this.props;

    return (
      <div>
        <p>Current holder of the bomb: </p>
        <img src={bombHolder.picture} />
        <p>Time left: {time}</p>
      </div>
    );
  }

}

export default Spectator;
