import { Injectable } from '@angular/core';
import { File } from 'ionic-native';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
//import { Camera, MediaCapture, MediaFile, CaptureError, CaptureImageOptions, CaptureVideoOptions, CaptureAudioOptions } from 'ionic-native';
import { Camera, CameraOptions } from '@ionic-native/camera';
/*
 Provider for accessing media (photos, video, audio) on the phone
 */

declare var cordova: any;

@Injectable()
export class MediaProvider {

  constructor(public http: Http,
              public camera: Camera)
  {
    console.log('Hello MediaProvider');
  }



  takePhotograph()
  // Accesses camera to take a photograph
  {
    console.log('MediaProvider: takePhotograph()');

    const options: CameraOptions = {
      quality: 50,
      allowEdit: true,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      //targetWidth: 480,
      //targetHeight: 480
    }

    return new Promise(resolve =>
    {
      this.camera.getPicture(options)
        .then((data) =>
        {
          // imageData is a base64 encoded string
          //this.cameraImage 	= "data:image/jpeg;base64," + data;
          resolve(data);
        });
    });
  }




  selectPhotograph()
  // Accesses the photo library for selecting a photo
  {
    const options: CameraOptions = {
      quality: 50,
      allowEdit: true,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 480,
      targetHeight: 480
    }

    return new Promise(resolve =>
    {
      this.camera.getPicture(options)
        .then((data) =>
        {
          //this.cameraImage 	= "data:image/jpeg;base64," + data;
          resolve(data);
        });

    });
  }
}

