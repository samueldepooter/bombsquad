//@flow

import React, {Component} from 'react';

let w = 0;
let h = 0;
let streaming = false;

type Props = {
  onTakePicture: () => void
}

class TakePicture extends Component {

  props: Props

  video: HTMLVideoElement
  canvas: HTMLCanvasElement
  ctx: ?CanvasRenderingContext2D

  componentDidMount() {

    this.video = ((document.querySelector(`.video`): any): HTMLVideoElement);
    this.canvas = ((document.querySelector(`.pictureCanvas`): any): HTMLCanvasElement);
    this.ctx = this.canvas.getContext(`2d`);

    this.videoHandler();

    this.video.addEventListener(`click`, () => this.snapshotHandler());

  }

  videoHandler() {
    navigator.getUserMedia  = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia;

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video: true})
        .then(stream => { // mediaDevices verplicht -> https://developer.mozilla.org/en/docs/Web/API/Navigator/getUserMedia
          this.video.srcObject = stream;
          this.video.play();
        })
        .catch(e => {
          console.log(e);
        });
    }

    this.video.addEventListener(`canplay`, () => {
      if (!streaming) {
        w = this.video.videoWidth;
        h = this.video.videoHeight;

        this.video.setAttribute(`width`, `${w}`);
        this.video.setAttribute(`height`, `${h}`);
        this.canvas.setAttribute(`width`, `${w}`);
        this.canvas.setAttribute(`height`, `${h}`);
        streaming = true;
      }
    }, false);
  }

  snapshotHandler() {
    this.canvas.width = w;
    this.canvas.height = h;

    if (this.ctx) this.ctx.drawImage(this.video, 0, 0, w, h);

    const data = this.canvas.toDataURL(`image/png`);

    const {onTakePicture} = this.props;
    onTakePicture(data);
  }

  render() {

    return (
      <section>

        <div className='camera'>
          <video className='video' autoPlay>Taking picture is not available!</video>
        </div>

        <canvas className='pictureCanvas'></canvas>
      </section>
    );
  }

}

export default TakePicture;
