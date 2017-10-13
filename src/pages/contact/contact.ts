import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, App, Platform} from 'ionic-angular';

import { CallNumber } from '@ionic-native/call-number';
import { AppVersion } from '@ionic-native/app-version';
import { NativeStorage } from '@ionic-native/native-storage';

import { CommonFunctionsProvider } from '../../providers/common-functions';

@IonicPage()
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  appVersionNumber: any;

  /* EHS App test code!!
  testImg: string = "http://edgbastonhigh.co.uk/SM4/Mutable/Uploads/sm3_emu_main_image/ac1-(9)-thumb.jpg"
  theHtmlString: string = '<p>Wednesday 3rd May saw Year 11’s last day in school before embarking on their study leave in ' +
    'preparation for their GCSE examinations. The day started with a continental breakfast of coffee and pastries and a ' +
    'review of their time through Senior School. After much shirt signing, cake eating and selfies the day ended with the ' +
    'annual emptying of lockers.</p><p>Mrs Campbell, Mrs Mooney, Miss Glover, Mr Lane, Mr Wilkins and Ms Johnson would like ' +
    'to wish all of the girls in Year 11 the very best of luck for their examinations. It has been a busy year and they have ' +
    'all worked extremely hard.</p><p>Mrs Cirillo-Campbell<br />Head of Year 11</p>  ' +
    '<p style="text-align:center">' +
    '<img alt="" border="0" height="428" hspace="0" src="http://ehs.red-wing.com/SM4/Mutable/Uploads/textarea_converted/content199cb4c4d04b7830de6f2aa418fb216a/entity_body/1493972671/image_0.jpg" style="width: 530px; height: 428px; margin: 0px; border: 0px solid black;" vspace="0" width="530" /></p><p> </p><p> </p>'
  */

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
  }



  dialNumber(numberToDial:string)
  // Phones the given number
  {
    this.callNumber.callNumber(numberToDial, true)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'));
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
