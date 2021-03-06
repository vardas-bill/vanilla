import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ModalController } from 'ionic-angular';

/*
import { ItemDetailPage } from '../item-detail/item-detail';
import { ItemCreatePage } from '../item-create/item-create';
import { ItemEditPage } from '../item-edit/item-edit';
*/

import { DataProvider } from '../../providers/providers';
import { CommonFunctionsProvider } from '../../providers/common-functions';
import { LocalStorageProvider } from '../../providers/local-storage';

import { VanillaApp } from '../../app/app.component';

import { APP_NAME } from '../../app/app.settings';

import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-pins',
  templateUrl: 'pins.html'
})
export class PinsPage {

  showProducts: boolean = false;
  showLoadingSpinner: boolean = true;
  showGrid: boolean = true;
  showCards: boolean = false;
  showList: boolean = false;

  hasDataItems: boolean = false;
  dataItems: any = [];
  itemImage: any = [];
  itemComments: any = [];
  itemCommentsCount: any = [];
  keyword: string;
  name: string;
  pageTitle: string;

  isAdminUser: boolean = true;


  constructor(public navCtrl: NavController,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public navParams: NavParams,
              public localStorageProvider: LocalStorageProvider,
              public commonFunctionsProvider: CommonFunctionsProvider,
              public dataProvider: DataProvider) {

    //this.keyword = this.navParams.get('keyword');
    //this.name = this.navParams.get('name');
    this.pageTitle = "Your Pins";

    this.isAdminUser = this.commonFunctionsProvider.isAdminUser;

    //this.displayDataItems();

  }



  ionViewDidEnter()
  // Make sure we refresh the data shown
  {
    this.displayDataItems();
  }



  displayDataItems()
  // Shows all of the items that have been pinned
  {
    //this.dataItems = [];
    //this.itemImage = [];

    this.dataProvider.getItems().then((data) => {
      console.log('PinsPage: displayDataItems: dataService.getItems() returned: ' + JSON.stringify(data));

      let numItems: number = Object.keys(data).length;
      let countOfFilteredItems: number = 0;

      console.log('PinsPage: displayDataItems(): numItems = ' + numItems);

      if (numItems !== 0) {
        this.hasDataItems = true;
        //this.dataItems = data;

        // Go through changing the edit date of each Plan from iso format to the format we want and add associated images to array.
        for (let i = 0; i < numItems; i++) {

          // Don't include this item if it isn't pinned
          if (this.localStorageProvider.pins.indexOf(data[i]._id) == -1) {
            //this.dataItems.splice(i,1);
            //i = i - 1;
            //numItems = numItems - 1;
            console.log('@@@@@@ item number i not pinned where i = ' + i);
            continue;
          }
          else {
            this.dataItems[countOfFilteredItems] = data[i];
            console.log('@@@@@@ countOfFilteredItems = ' + countOfFilteredItems +
            'this.dataItems[countOfFilteredItems].title = ' + this.dataItems[countOfFilteredItems].title);
            countOfFilteredItems++;
          }

          let date = this.dataItems[countOfFilteredItems-1].updated;
          let momentDate = moment(date);
          this.dataItems[countOfFilteredItems-1].updated = momentDate.utc().format('MMM Do YYYY');
          //this.dataItems[countOfFilteredItems-1].updated = moment(this.dataItems[countOfFilteredItems-1].updated).format('MMM Do YYYY');

          // Initialise itemImage array entry in preparation for being filled by displayMedia
          this.itemImage.push({'type':'', 'media':''});
          this.displayMedia(countOfFilteredItems-1, this.dataItems[countOfFilteredItems-1].media[0]);

          /*
          // Initialise itemComments array entry in preparation for being filled by displayMedia
          this.itemComments.push({'type':'', 'media':''});
          this.displayComments(countOfFilteredItems-1, this.dataItems[countOfFilteredItems-1]._id);
          */
        }

        if (this.dataItems.length < 1 && this.localStorageProvider.showNoPinsMessage()) {
          let toast = this.toastCtrl.create({
            message: "You don't have anything pinned yet. You can pin and unpin products using the pin at the top of the product page.",
            duration: 5000,
            position: 'top'
          });
          toast.present();

          this.localStorageProvider.doneNoPinsMessage();
        }
        // Trim the this.dataItems array if it is longer than the countOfFilteredItems (which can happen if an item has been unpinned)
        else if (this.dataItems.length > countOfFilteredItems) {
          this.dataItems = this.dataItems.slice(0, countOfFilteredItems);
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
        console.log("PinsPage: displayItems() - No items to show");
      }

      return;

    });
  }



  displayMedia(itemIndex, annotationID)
  // Adds an item's image to the itemImage[] array
  {
    console.log('PinsPage: displayMedia(): Called with itemIndex = ' + itemIndex + ', ' + annotationID);

    // Get every step so it can be shown
    this.dataProvider.getAnnotation(annotationID).then((annotation)=>
    {
      if (annotation) {
        this.itemImage[itemIndex] = annotation[0];
        //console.log('PinsPage: displayMedia(): itemImage array after getting annotation is now: ' + JSON.stringify(this.itemImage));
      }
      else console.log('PinsPage: displayMedia(): getAnnotation: NO annotation returned ');
    });
  }



  displayComments(itemIndex, itemID)
  // Gets the comments for the given item
  {
    console.log('PinsPage: displayComments(): Called with itemIndex = ' + itemIndex + ', and itemID = ' + itemID);

    // Get every comment so it can be shown
    this.dataProvider.getComments(itemID).then((comments)=>{
      if (comments) {
        console.log('PinsPage: displayComments(): number of comments found is = ' + comments.length);
        this.itemCommentsCount[itemIndex] = comments.length;
        // Put array of comments in most recent first order
        this.itemComments[itemIndex] = comments.reverse();
      }
      else {
        console.log('PinsPage: getComments(): No comments found ');
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
    console.log('PinsPage: addItem()');
    let addModal = this.modalCtrl.create('ItemCreatePage');
    addModal.onDidDismiss(item => {
      // Refresh the display
      this.displayDataItems();
    });
    addModal.present();
  }



  editItem(item)
  // Shows the ItemEditPage to let user edit an item
  {
    console.log('PinsPage: editItem(): item = ' + item._id);
    let addModal = this.modalCtrl.create('ItemEditPage', {'itemID':item._id});
    addModal.onDidDismiss(item => {
      // Refresh the display
      this.displayDataItems();
    });
    addModal.present();
  }



  deleteItem(item)
  // Deletes an item
  {
    console.log('PinsPage: deleteItem()');
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
            this.dataProvider.getItem(item._id).then((item)=>{
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
  // Goes to the item details page
  {
    console.log('PinsPage: openItem()');
    this.navCtrl.push('ItemDetailPage', {
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



  companyInstagram()
  {
    this.commonFunctionsProvider.gotoInstagram();
  }
}
