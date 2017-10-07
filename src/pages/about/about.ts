import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CommonFunctionsProvider } from '../../providers/common-functions'

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  constructor(public navCtrl: NavController,
              public commonFunctionsProvider: CommonFunctionsProvider,
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
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
