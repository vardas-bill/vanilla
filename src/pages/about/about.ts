import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { NativeStorage } from '@ionic-native/native-storage';

import { CommonFunctionsProvider } from '../../providers/common-functions'

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  secretClickCount: number = 0;
  appVersionNumber: any;

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public nativeStorage: NativeStorage,
              public appVersion: AppVersion,
              public platform: Platform,
              public commonFunctionsProvider: CommonFunctionsProvider,
              public navParams: NavParams) {
    if (this.platform.is('cordova')) {
      this.appVersion.getVersionNumber().then((result: any) => {
        this.appVersionNumber = result;
      });
    } else this.appVersionNumber = 'ionic serve';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

  ionViewDidEnter()
  {
    console.log('AboutPage: ionViewDidEnter()');
    this.secretClickCount = 0;
  }


  countClicks()
  // Turns admin mode on if user clicks the correct amount of times
  {
    this.secretClickCount++;

    // Seven clicks means this might be an admin user
    if (this.secretClickCount == 7) {
      this.secretClickCount = 0;
      let prompt = this.alertCtrl.create({
        title: 'Password',
        message: "Enter password to access additional features. Leave password field empty if you want to stop seeing additional features.",
        inputs: [
          {
            name: 'password',
            placeholder: 'password'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save Password',
            handler: data => {
              //alert('Password = ' + data.password);
              this.nativeStorage.setItem('adminPassword', data.password)
                .then(
                  () => {},
                  error => {}
                );
            }
          }
        ]
      });
      prompt.present();
    }
  }


  companyFacebook()
  {
    this.commonFunctionsProvider.gotoFacebook();
  }



  companyTwitter()
  {
    this.commonFunctionsProvider.gotoTwitter();
  }



  companyInstagram()
  {
    this.commonFunctionsProvider.gotoInstagram();
  }

}
