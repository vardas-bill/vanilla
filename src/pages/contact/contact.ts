import { Component } from '@angular/core';
import { NavController, AlertController, App, Platform} from 'ionic-angular';

import { CallNumber } from '@ionic-native/call-number';
import { AppVersion } from '@ionic-native/app-version';
import { NativeStorage } from '@ionic-native/native-storage';

import { CommonFunctionsProvider } from '../../providers/common-functions'


@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  appVersionNumber: any;
  secretClickCount: number = 0;

  constructor(public callNumber: CallNumber,
              public commonFunctionsProvider: CommonFunctionsProvider,
              public appVersion: AppVersion,
              public nativeStorage: NativeStorage,
              public platform: Platform,
              public alertCtrl: AlertController,
              public navCtrl: NavController) {

    if (this.platform.is('cordova')) {
      this.appVersion.getVersionNumber().then((result: any) => {
        this.appVersionNumber = result;
      });
    } else this.appVersionNumber = 'ionic serve';
  }

  ionViewDidLoad()
  {
    console.log('ContactsPage: ionViewDidLoad()');
  }

  ionViewDidEnter()
  {
    console.log('ContactsPage: ionViewDidEnter()');
    this.secretClickCount = 0;
  }



  dialNumber(numberToDial:string)
  // Phones the given number
  {
    this.callNumber.callNumber(numberToDial, true)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'));
  }


  countClicks()
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
}
