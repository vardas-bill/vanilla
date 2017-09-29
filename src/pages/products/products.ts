import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';

import { ItemDetailPage } from '../item-detail/item-detail';
import { ItemCreatePage } from '../item-create/item-create';
import { ItemEditPage } from '../item-edit/item-edit';

import { DataProvider } from '../../providers/providers';
import { CommonFunctionsProvider } from '../../providers/common-functions';

import { APP_NAME } from '../../app/app.settings';

import * as moment from 'moment';

/*
  Generated class for the Cards page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-products',
  templateUrl: 'products.html'
})
export class ProductsPage {

  showProducts: boolean = false;
  showLoadingSpinner: boolean = true;
  showGrid: boolean = true;
  showCards: boolean = false;
  showList: boolean = false;

  hasDataItems: boolean = false;
  dataItems: any[];
  itemImage: any = [];
  itemComments: any = [];
  itemCommentsCount: any = [];
  keyword: string;
  name: string;
  pageTitle: string;

  adminMode: boolean = true;


  constructor(public navCtrl: NavController,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public navParams: NavParams,
              public commonFunctionsProvider: CommonFunctionsProvider,
              public dataProvider: DataProvider) {

    this.keyword = this.navParams.get('keyword');
    this.name = this.navParams.get('name');
    this.pageTitle = this.navParams.get('pageTitle');

    this.displayDataItems();

  }



  displayDataItems()
  // Shows all of the items
  {
    this.dataProvider.getItems().then((data) => {
      console.log('ProductsPage: displayDataItems: dataService.getItems() returned: ' + JSON.stringify(data));

      let numItems = Object.keys(data).length;

      console.log('ProductsPage: displayDataItems(): numItems = ' + numItems);

      if (numItems !== 0) {
        this.hasDataItems = true;
        this.dataItems = data;

        // Go through changing the edit date of each Plan from iso format to the format we want and add associated immages to array.
        for (let i = 0; i < numItems; i++) {
          // Don't include this entry if it doesn't match the keyword
          console.log('+++++ this.dataItems[i].itemType = ' + this.dataItems[i].itemType + ', this.keyword = ' + this.keyword
            + ', this.dataItems[i].itemType.indexOf(this.keyword) = ' + this.dataItems[i].itemType.indexOf(this.keyword));
          if (this.keyword != 'ALL' && this.keyword != '' && this.dataItems[i].itemType.indexOf(this.keyword) == -1) {
            this.dataItems.splice(i,1);
            i = i - 1;
            numItems = numItems - 1;
            continue;
          }

          this.dataItems[i].updated = moment(this.dataItems[i].updated).format('MMM Do YYYY');

          // Initialise itemImage array entry in preparation for being filled by displayMedia
          this.itemImage.push({'type':'', 'media':''});
          this.displayMedia(i, this.dataItems[i].media[0]);

          // Initialise itemComments array entry in preparation for being filled by displayMedia
          this.itemComments.push({'type':'', 'media':''});
          this.displayComments(i, this.dataItems[i]._id);
        }
        //this.showProducts = true;
        setTimeout(()=>{
          this.showProducts = true;
          this.showLoadingSpinner = false;
          }, 500);

      }
      else {
        this.hasDataItems = false;
        this.dataItems = [];
        console.log("ProductsPage: displayPlans() - No items to show");
      }

      return;

    });
  }



  displayMedia(itemIndex, annotationID)
  // Adds an item's image to the itemImage[] array
  {
    console.log('ListMasterPage: displayMedia(): Called with itemIndex = ' + itemIndex + ', ' + annotationID);

    // Get every step so it can be shown
    this.dataProvider.getAnnotation(annotationID).then((annotation)=>
    {
      if (annotation) {
        this.itemImage[itemIndex] = annotation[0];
        console.log('ListMasterPage: displayMedia(): itemImage array after getting annotation is now: ' + JSON.stringify(this.itemImage));
      }
      else console.log('ListMasterPage: displayMedia(): getAnnotation: NO annotation returned ');
    });
  }



  displayComments(itemIndex, itemID)
  // Gets the comments for the given item
  {
    console.log('ListMasterPage: displayComments(): Called with itemIndex = ' + itemIndex + ', and itemID = ' + itemID);

    // Get every comment so it can be shown
    this.dataProvider.getComments(itemID).then((comments)=>{
      if (comments) {
        console.log('ProductsPage: displayComments(): number of comments found is = ' + comments.length);
        this.itemCommentsCount[itemIndex] = comments.length;
        // Put array of comments in most recent first order
        this.itemComments[itemIndex] = comments.reverse();
      }
      else {
        console.log('ItemDetailPage: getComments(): No comments found ');
        this.itemCommentsCount[itemIndex] = 0;
      }
    });
  }



  showAsCards()
  {
    this.showCards = true;
    this.showList = false;
    this.showGrid = false;
  }



  showAsGrid()
  {
    this.showCards = false;
    this.showList = false;
    this.showGrid = true;
  }



  showAsList()
  {
    this.showCards = false;
    this.showList = true;
    this.showGrid = false;
  }



  addItem()
  // Shows the ItemCreatePage for adding a new item
  {
    console.log('SwipePage: addItem()');
    let addModal = this.modalCtrl.create(ItemCreatePage);
    addModal.onDidDismiss(item => {
      // Refresh the display
      this.displayDataItems();
    });
    addModal.present();
  }



  editItem(itemID)
  // Shows the ItemEditPage to let user edit an item
  {
    console.log('SwipePage: editItem(): itemID = ' + itemID);
    let addModal = this.modalCtrl.create(ItemEditPage, {'itemID':itemID});
    addModal.onDidDismiss(item => {
      // Refresh the display
      this.displayDataItems();
    });
    addModal.present();
  }



  deleteItem(itemID)
  // Deletes an item
  {
    console.log('SwipePage: deleteItem()');
    let alert = this.alertCtrl.create({
      title: 'Delete item',
      message: 'Are you sure you want to permanently delete this?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.dataProvider.getItem(itemID).then((item)=>{
              if (item) this.dataProvider.removeItem(item._id,item._rev).then((result)=>{
                this.displayDataItems();
              });
            })
          }
        }
      ]
    });
    alert.present();
  }



  openItem(item, itemImage)
  /**
   * Navigate to the detail page for this item.
   */
  {
    console.log('SwipePage: openItem()');
    this.navCtrl.push(ItemDetailPage, {
      item: item,
      itemImage: itemImage
    });
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