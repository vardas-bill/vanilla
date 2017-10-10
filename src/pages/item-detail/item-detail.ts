import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';

import { CommentCreatePage } from '../comment-create/comment-create';

//import { Items } from '../../providers/providers';
import { DataProvider } from '../../providers/data';
import { LocalStorageProvider } from '../../providers/local-storage';

import { CommonFunctionsProvider } from '../../providers/common-functions';


@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {

  item:             any;
  itemImage:        any;
  pinned: boolean = false;
  commentCount:     number = 0;
  comments:         any;
  displayComments:  boolean = false;

  constructor(public navCtrl: NavController,
              public modalCtrl: ModalController,
              public dataProvider: DataProvider,
              public localStorageProvider: LocalStorageProvider,
              public commonFunctionsProvider: CommonFunctionsProvider,
              navParams: NavParams) {

    this.item = navParams.get('item');
    console.log('ItemDetailPage: Constructor: item param is = ' + JSON.stringify(this.item));
    this.itemImage = navParams.get('itemImage');

    this.pinned = this.localStorageProvider.isPinned(this.item._id);

    this.getComments();
  }



  ionViewDidLoad()
  {
    console.log('ItemDetailPage did load');
  }



  getComments()
  {
    this.dataProvider.getComments(this.item._id).then((comments)=>{
      if (comments) {
        console.log('ItemDetailPage: getComments(): number of comments found is = ' + comments.length);
        this.commentCount = comments.length;
        // Put array of comments in most recent first order
        this.comments = comments.reverse();
      }
      else {
        console.log('ItemDetailPage: getComments(): No comments found ');
        this.commentCount = comments.length;
      }
    });
  }



  showComments()
  {
    this.displayComments = !this.displayComments;
  }



  addComment()
  /**
   * Prompt the user to add a new comment. This shows our CommentCreatePage in a
   * modal and then adds the new comment if the user created one.
   */
  {
    console.log('ItemDetailPage: addComment()');
    let addModal = this.modalCtrl.create(CommentCreatePage);
    addModal.onDidDismiss(comment => {
      console.log('ItemDetailPage: CommentCreatePage returned = ' + JSON.stringify(comment));
      if (comment) {
        // addComment(theComment, thePhotoID, theUserID, theItemID)
        this.dataProvider.addComment(comment.comment, comment.photoID, 'Anonymous', this.item._id).then((id)=>{
          this.getComments();
          this.displayComments = true;
        });
      }
    })
    addModal.present();
  }



  togglePin()
  // Toggles whether or not this item is pinned
  {
    if (!this.pinned) this.localStorageProvider.addPin(this.item._id);
    else this.localStorageProvider.removePin(this.item._id);
    this.pinned = !this.pinned;
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
