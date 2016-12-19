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
  onPhone: boolean;
  picturebutton: HTMLElement;

  componentDidMount() {

    this.canvas = ((document.querySelector(`.pictureCanvas`): any): HTMLCanvasElement);
    this.ctx = this.canvas.getContext(`2d`);

    if (this.onPhone) {
      this.picturebutton.style.display = `none`;

    } else {
      this.picturebutton.style.display = `inline-block`;
      this.video = ((document.querySelector(`.video`): any): HTMLVideoElement);

      this.videoHandler();
      this.video.addEventListener(`click`, () => this.snapshotHandler());
    }
  }



  videoHandler() {
    navigator.getUserMedia  = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia;

    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({video: true})
        .then(stream => { // mediaDevices verplicht -> https://developer.mozilla.org/en/docs/Web/API/Navigator/getUserMedia
          this.video.srcObject = stream; //srcObject verplicht, werkt niet met src
          this.video.play();
        })
        .catch(e => {
          console.log(e);
        });
    }

    this.video.addEventListener(`canplay`, () => {
      if (!streaming) {
        w = this.video.videoWidth; //videoWidth & videoHeight verplicht, werkt niet met width & height
        h = this.video.videoHeight;

        this.video.setAttribute(`width`, `${w}`);
        this.video.setAttribute(`height`, `${h}`);
        this.canvas.setAttribute(`width`, `${w}`);
        this.canvas.setAttribute(`height`, `${h}`);
        streaming = true;
      }
    }, false);
  }

  onTakePictureChange(e: Object) {

    /* OUDE CODE: laat ik even staan want dit werkt zeker op alle smartphones maar is niet geoptimised */
    // const files = e.target.files;
    // let file;
    // if (files && files.length > 0) {
    //   file = files[0];
    //   const fileReader = new FileReader();
    //   fileReader.onload = e => {
    //     const {onTakePicture} = this.props;
    //     onTakePicture(e.target.result);
    //   };
    //   fileReader.readAsDataURL(file);
    // }

    const files = e.target.files;
    let file;
    if (files && files.length > 0) {
      file = files[0];

      const fileReader = new FileReader();
      fileReader.onload = e => {

        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {

          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          this.canvas.width = width;
          this.canvas.height = height;

          if (this.ctx) this.ctx.drawImage(img, 0, 0, width, height);

          const dataurl = this.canvas.toDataURL(`image/png`);

          const {onTakePicture} = this.props;
          onTakePicture(dataurl);

        };
      };

      fileReader.readAsDataURL(file);

    }
  }

  snapshotHandler() {
    this.canvas.width = w;
    this.canvas.height = h;

    if (this.ctx) this.ctx.drawImage(this.video, 0, 0, w, h);

    const data = this.canvas.toDataURL(`image/png`);

    const {onTakePicture} = this.props;
    onTakePicture(data);
  }

  checkOnPhone() {
    if (navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
    ) {
      this.onPhone = true;
    }
    else {
      this.onPhone = false;
    }

    return this.onPhone;
  }

  imageSourceRender() {

    if (this.checkOnPhone()) {
      return (
        <div className='mobilePictureButtonWrapper'>
          <label htmlFor='pictureButton' className='takePictureLabel'></label>
          <input type='file' className='takePictureButton' id='pictureButton' capture accept='image/*' onChange={e => this.onTakePictureChange(e)} />
        </div>
      );
    } else {
      return (
      <div>
        <img src='' className='myImg' />
        <video className='video' width='85rem' autoPlay>Taking picture is not available!</video>
      </div>);
    }
  }

  render() {

    return (
      <section className='picture phonewrapper'>
        <header className='globalheader'>
          <div className='screw screwleft'></div>
          <h2>Take a selfie! <br /> This will be your avatar.</h2>
          <div className='screw screwright'></div>
        </header>
        <div className='camera'>
        {this.imageSourceRender()}
        </div>
        <canvas className='pictureCanvas'></canvas>
        <div className='picturebuttonwrapper'>
          <button className='picturebutton' ref={picturebutton => this.picturebutton = picturebutton} onClick={() => this.snapshotHandler()}></button>
        </div>
      </section>


      // <section>
      //
      //   <div className='camera'>
      //     <img src='' className='myImg' />
      //     <input type='file' className='takePicture' capture accept='image/*' onChange={e => this.onTakePictureChange(e)} />
      //     <video className='video' autoPlay>Taking picture is not available!</video>
      //   </div>
      //
      //   <canvas className='pictureCanvas'></canvas>
      // </section>
    );
  }

}

export default TakePicture;
