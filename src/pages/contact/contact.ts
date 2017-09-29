import { Component } from '@angular/core';
import { NavController, App, Platform} from 'ionic-angular';

import { CallNumber } from '@ionic-native/call-number';
import { AppVersion } from '@ionic-native/app-version';

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
              public platform: Platform,
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

    if (this.secretClickCount == 7) alert('Admin!');
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
