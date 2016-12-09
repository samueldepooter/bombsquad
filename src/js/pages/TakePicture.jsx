import React, {Component, PropTypes} from 'react';

const width = 320;    // We will scale the photo width to this
let height = 0;     // This will be computed based on the input stream

let streaming = false;

let video = undefined;
let canvas = undefined;
let picture = undefined;
let takePictureBtn = undefined;

class TakePicture extends Component {

  componentDidMount() {
    video = document.querySelector(`.video`);
    canvas = document.querySelector(`.pictureCanvas`);
    picture = document.querySelector(`.yourPicture`);
    takePictureBtn = document.querySelector(`.takePictureBtn`);

    navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(stream => {
        video.srcObject = stream;
        video.play();
      })
      .catch(e =>  {
        console.log(`An error occured! ${e}`);
      });

    video.addEventListener(`canplay`, () => {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);

        video.setAttribute(`width`, width);
        video.setAttribute(`height`, height);
        canvas.setAttribute(`width`, width);
        canvas.setAttribute(`height`, height);
        streaming = true;
      }
    }, false);

    takePictureBtn.addEventListener(`click`, e => {
      this.takeAPicture();
      e.preventDefault();
    }, false);
  }

  takeAPicture() {
    const context = canvas.getContext(`2d`);

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    //const data = canvas.toDataURL(`image/png`);
    //picture.setAttribute(`src`, data);
  }

  render() {

    const {takeYourPicture} = this.props;

    return (
      <section>

        <div className='camera'>
          <video className='video'>Taking picture is not available.</video>
          <button className='takePictureBtn' /*onClick={e => takeYourPicture(e)}*/>Take a picture</button>
        </div>

        <canvas className='pictureCanvas'></canvas>

        <div className='yourPictureWrap'>
          <img className='yourPicture' alt='Picture will appear here' />
        </div>

      </section>
    );
  }

}

TakePicture.propTypes = {
  takeYourPicture: PropTypes.func
};

export default TakePicture;
