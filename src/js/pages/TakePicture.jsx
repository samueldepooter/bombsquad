import React, {Component} from 'react';

let video = undefined;
let canvas = undefined;


class TakePicture extends Component {

  componentDidMount() {
    video = document.querySelector(`.video`);
    canvas = document.querySelector(`.pictureCanvas`);

    this.videoHandler();
  }

  videoHandler() {
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(stream => {
        video.srcObject = stream;
        video.play();
      })
      .catch(e =>  {
        console.log(`An error occured: ${e}`);
      });
  }

  onTakePicture(e) {
    e.preventDefault();

    const context = canvas.getContext(`2d`);
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const pictureData = canvas.toDataURL(`image/png`);

    const {onTakePicture} = this.props;
    onTakePicture(pictureData);
  }

  render() {

    return (
      <section>

        <div className='camera'>
          <video className='video'>Taking picture is not available!</video>
          <button className='takePictureBtn' onClick={e => this.onTakePicture(e)}>Take a picture</button>
        </div>

        <canvas className='pictureCanvas'></canvas>

      </section>
    );
  }

}

export default TakePicture;
