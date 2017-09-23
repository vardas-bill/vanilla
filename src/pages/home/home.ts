import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';

import { DataProvider } from '../../providers/data';
import { CommonFunctionsProvider } from '../../providers/common-functions';

import { ProductsPage } from '../products/products';
import { SwipePage } from '../swipe/swipe';

/*
This is the main page for the App and is the page from which the
user chooses the category of product to look at
 */

import {
  APP_NAME,
  DO_LOGIN,
  MAJOR_CATEGORY_BUTTON,
  PRODUCT_CATEGORY1_SUBCATEGORIES,
  PRODUCT_CATEGORY2_SUBCATEGORIES,
  PRODUCT_CATEGORY3_SUBCATEGORIES,
  PRODUCT_CATEGORY4_SUBCATEGORIES,
  PRODUCT_CATEGORY5_SUBCATEGORIES,
  PRODUCT_CATEGORY6_SUBCATEGORIES } from '../../app/app.settings';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  showLoadingSpinner: boolean = true;

  majorCategoryButton: any = MAJOR_CATEGORY_BUTTON;


  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public commonFunctionsProvider: CommonFunctionsProvider,
              public events: Events,
              public dataProvider: DataProvider) {

    console.log('HomePage: Constructor()');

    // Wait until the database has been synced before letting user select a product category
    this.events.subscribe('SYNC_FINISHED', (finished) => {
      this.showLoadingSpinner = false;
      this.events.unsubscribe('SYNC_FINISHED', null);
      console.log('***** HomePage: constructor(): SYNC_FINISHED event received');
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

  ionViewDidEnter()
  {
    console.log('ionViewDidEnter HomePage');
  }


  goto(categoryButton)
  {
    let info: any = {
      keyword: this.majorCategoryButton[categoryButton].keyword,
      name: this.majorCategoryButton[categoryButton].name,
      pageTitle: this.majorCategoryButton[categoryButton].pageTitle
    };

    // At some point we will let some of the HomePage category buttons point to pages other than the ProductsPage
    switch (categoryButton) {
      case 0:
        this.navCtrl.push(ProductsPage, info);
        break;
      case 1:
        this.navCtrl.push(ProductsPage, info);
        break;
      case 2:
        this.navCtrl.push(ProductsPage, info);
        break;
      case 3:
        this.navCtrl.push(ProductsPage, info);
        break;
      case 4:
        this.navCtrl.push(ProductsPage, info);
        break;
      case 5:
        this.navCtrl.push(ProductsPage, info);
        break;
    }
  }



  companyFacebook()
  // Shows the company's Facebook page
  {
    this.commonFunctionsProvider.gotoFacebook();
  }



  companyTwitter()
  // Shows the company's Twitter page
  {
    this.commonFunctionsProvider.gotoTwitter();
  }
}
