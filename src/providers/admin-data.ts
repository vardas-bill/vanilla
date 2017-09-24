import { Injectable, OpaqueToken } from '@angular/core';
import { Network } from 'ionic-native';
import { NativeStorage } from '@ionic-native/native-storage';
import { Platform, ToastController, AlertController, Events} from 'ionic-angular';

import 'rxjs/add/operator/map';
import PouchDB from 'pouchdb';

//import CryptoPouch from 'crypto-pouch';
import CryptoJS from 'crypto-js';

import { DO_LOGIN,
  APP_NAME,
  PRODUCT_DB_NAME,
  COUCHDB_SERVER,
  COUCHDB_SERVER_URL,
  COUCHDB_USER,
  COUCHDB_PASSWORD,
  REMOTE_SERVER,
  SKIP_SECURESTORAGE,
  ENCRYPT_DATA } from '../app/app.settings';

/*
  PouchDB/CouchDB functions for admin user to add/edit/delete documents.
*/
@Injectable()
export class AdminDataProvider {

  data:                       any;
  _userDB:                    any;
  _remoteUserDB:              any;
  _productDB:                 any;
  _remoteProductDB:           any;
  encryptKey:                 string = '';
  _syncHandler:               any = null;
  remote:                     any;
  syncHandler:                any;

  // Array of field names used by the encryption functions to determine which fields need to be JSON.stringified
  // All the fields listed in this array will be passed through JSON.stringify (encrypt) and JOSN.parse (decrypt)
  // If a field is a string it does not need to be in this list. ALL other fields do need to be in this list.
  nonStringFields:            any = [
    'media',
    'flagged',
    'offer',
    'annotations'];

  constructor(public alertCtrl: AlertController,
              public nativeStorage: NativeStorage,
              public platform: Platform,
              public events: Events) {
    console.log('Hello AdminDataProvider Provider');
  }

  cancelSyncing()
  // Cancels syncing data to the server
  {
    if (this.syncHandler != null) this.syncHandler.cancel();
  }



  getDBPaths()
  {
    console.log('DataProvider: getDBPaths(): called.');

    return new Promise(resolve => {
      if (this.platform.is('cordova')) {
        this.nativeStorage.getItem('dbPaths')
          .then(
            data => {
              console.log('Data: getDBPaths(): get from secure storage = ' + data);
              resolve(JSON.parse(data));
            },
            error => {
              console.log('Data: getDBPaths(): get from secure ERROR = ' + error);
              resolve(false);
            }
          );
      }
      else {
        resolve(false);
      }
    });
  }



  init()//localDBName, remoteDBName)
  // Initialises the database - Called when an admin user enters the correct password
  {
    console.log('AdminDataProvider: init() called');

    // Get the DB paths from local storage so we can open and sync to them
    return this.getDBPaths().then((paths:any)=>{
      console.log('AdminDataProvider: init(): getDBPaths returned = ' + JSON.stringify(paths));

      var localProductDBName = PRODUCT_DB_NAME;

      if (paths) {
        var localUserDBName = paths.localUserDB;
        var remoteUserDBName = paths.remoteUserDB;
        var remoteProductDBName = paths.remoteProductDB;

        console.log('AdminDataProvider: init(): getDBPaths gave = ' + JSON.stringify(paths));
      }
      else { // This needed for testing with ionic serve when running locally on webserver when there is not any localstorage
        localUserDBName = "a@a.com";

        // If we are running the login version of the App use the SuperLogin server paths
        if (DO_LOGIN) {
          remoteUserDBName = "http://SDAaphrRTlm7Fg0J9sFHhA:W7oft_IsTtaZmOZ04Q0Tdg@localhost:5984/vanilla$a(40)a(2e)com";
          remoteProductDBName = "http://SDAaphrRTlm7Fg0J9sFHhA:W7oft_IsTtaZmOZ04Q0Tdg@localhost:5984/product";
        }
        else {
          remoteUserDBName = null;
          remoteProductDBName = "http://localhost:5984/" + PRODUCT_DB_NAME;
        }
        console.log('AdminDataProvider: init(): getDBPaths returned false. Using paths remoteUserDBName = ' + remoteUserDBName + ', remoteProductDBName = ' + remoteProductDBName);

      }


      // ------------------------------------------------
      // Make an admin write enabled connection to the shared product database
      //
      this._productDB = new PouchDB(localProductDBName);

      console.log('AdminDataProvider: init(): PouchDB database opened for localProductDBName = ' + localProductDBName);
      console.log('AdminDataProvider: init(): this._productDB = ' + JSON.stringify(this._productDB));

      // Insert the url for the CouchDB server into the remoteProductDBName
      var realRemoteProductDB = remoteProductDBName.replace("localhost:5984", COUCHDB_SERVER_URL);

      console.log('AdminDataProvider: init(): real remoteProductDB path being used is: ' + realRemoteProductDB);

      // :TO DO: Use password entered by user (not one stored in the app!)
      //        AND - Replace 'vanillaadmin' with a generated username from PRODUCT_DB_NAME + 'admin'
      let pouchDBRemoteOptions = {
        skip_setup: true,
        ajax: {
          headers: {Authorization: 'Basic ' + window.btoa('vanillaadmin' + ':' + '1234')}
        }
      };

      this._remoteProductDB = new PouchDB(realRemoteProductDB, pouchDBRemoteOptions);

      console.log('AdminDataProvider: init(): this._remoteProductDB = ' + JSON.stringify(this._remoteProductDB));

      let options = {
        live: true,
        retry: true,
        continuous: true
      };

      // Setup for sending changes to the local DB to the remote DB
      this._productDB.replicate.to(this._remoteProductDB) //No options here -> One time sync
        .on('complete', (info) => {

          this.events.publish('ADMIN_SYNC_FINISHED', true); // Let login etc. know we have synced the admin accessible DB
          console.log('++++++ AdminDataProvider: init(): *productDB* first one time replicate.from has completed about to do live syncing now');

          return this._productDB.replicate.to(this._remoteProductDB, options) //Continous replicate to with options
            .on('complete', (info) => {
              console.log('***** AdminDataProvider: init() *productDB* Complete: Handling syncing complete');
              console.dir(info);
            })
            .on('change', (info) => {
              console.log('***** AdminDataProvider: init() *productDB* Change: Handling syncing change');
              console.dir(info);
            })
            .on('paused', (info) => {
              console.log('***** AdminDataProvider: init() *productDB* Paused: Handling second replicate.from pause');
              console.dir(info);
            })
            .on('active', (info) => {
              console.log('***** AdminDataProvider: init() *productDB* Active: Handling syncing resumption');
              console.dir(info);
            })
            .on('error', (err) => {
              console.log('***** AdminDataProvider: init() *productDB* Error: Handling second replicate.from error');
              console.dir(err);
            })
            .on('denied', (err) => {
              console.log('***** AdminDataProvider: init() *productDB* Denied: Handling second replicate from denied');
              console.dir(err);
            });
        })
        .on('error', (err) => {
          console.log('ERROR ***** AdminDataProvider: init() *productDB* Error: First replicate.from: Handling error');
          console.dir(err);
          this.events.publish('ADMIN_SYNC_FINISHED', false); // Let login etc. know sync failed
        })
        .on('denied', (err) => {
          console.log('DENIED ***** AdminDataProvider: init() *productDB* Denied: First replicate.from: Handling denied');
          console.dir(err);
        });
     });
  }


  //========================
  //+++ PRODUCTS DB ++++++++
  //========================

  //=====================
  // ITEMS

  getItem(id)
  // Get a specific item
  {
    return this._productDB.get(id)
      .then((doc) => {
        console.log('AdminDataProvider: getItem(): Found item: ' + JSON.stringify(doc));
        var decryptedData = this.decryptData(doc);
        console.log('Data: getItem(): About to return: ' + JSON.stringify(decryptedData));
        return decryptedData;
      })
      .catch((err)=>{
        console.log('ERROR AdminDataProvider: getItem(): could not get item. err = : ' + err);
        return false;
      });
  }



  getItems()
  // Get all of a user's items
  {
    return this._productDB.allDocs({
      include_docs: true,
      startkey: 'ITEM:',
      endkey: 'ITEM:\uffff',
      attachments: true})

      .then((doc)=> {
        let k;
        let items = [];
        let row = doc.rows;
        let decryptedData:any = [];

        for (k in row) {
          let item = row[k].doc;

          item = this.decryptData(item);

          // Items that have flagged = true go to the top (unshift) otherwise they go to the bottom (push)
          if (item.flagged)
            items.unshift(item);
          else
            items.push(item);
        }
        console.log('AdminDataProvider: getItems(): returning: ' + JSON.stringify(items));
        return items;
      })
      .catch((err)=>{
        return false;
      });
  }



  countItems()
  // Counts the number of items
  {
    return this._productDB.allDocs({
      include_docs: false,
      startkey: 'ITEM:',
      endkey: 'ITEM:\uffff',
      attachments: false
    })
      .then(function (result) {
        return(result.rows.length)
      })
      .catch(function (err) {
        return(0);
      });
  }



  addItem(data)
  // Add a new item (e.g. a product or service)
  {
    console.log('AdminDataProvider: addItem(): called with data = ' + JSON.stringify(data));

    let timeStamp = new Date().toISOString();
    let item = {
      _id: 'ITEM:' + timeStamp,
      itemType: data.itemType.toLowerCase(),
      title: data.title,
      productID: data.productID,
      description: data.description,
      size: data.size,
      price: data.price,
      currency: data.currency,
      media: data.media,         // An array of IDs for the associated media texts, images, audio, etc.
      flagged: data.flagged,
      specialOffer: data.specialOffer,
      offerDescription: data.offerDescription,
      created: timeStamp,
      updated: timeStamp
    };

    var encryptedData = this.encryptData(item);
    console.log('AdminDataProvider: addItem(): Completed encryption of item. encryptedData = ' + JSON.stringify(encryptedData));

    return this._productDB.put(encryptedData)
      .then(function (response) {
        console.log('AdminDataProvider: addItem(): Put returned - ' + JSON.stringify(response));
        return response.id;
      })
      .catch((err) => {
        console.log('ERROR: AdminDataProvider: addItem(): Error: ' + err);
        return false;
      });
  }



  updateItem(itemData:any)//id, title, important, steps, people)
  // Amend an existing item
  {
    console.log('AdminDataProvider: updateItem() called with new itemData = ' + JSON.stringify(itemData));
    console.log('AdminDataProvider: updateItem() itemData._id = ' + itemData._id);

    // Get from the DB the item we want to change to make sure we have the most up to date rev
    return this.getItem(itemData._id)
      .then((item: any) => {
        let now = new Date().toISOString();
        let updatedItem:any = itemData;

        updatedItem._id = itemData._id;
        updatedItem._rev = item._rev;
        updatedItem.created = item.created;
        updatedItem.updated = now;

        console.log('AdminDataProvider: updateItem() about to put updatedItem = ' + JSON.stringify(itemData));

        this._productDB.put(updatedItem)
          .then((result) => {
            console.log('AdminDataProvider: updateItem() put succeeded');
            return(true);
          })
          .catch((err)=>{
            console.log('ERROR: AdminDataProvider: updateItem(): Error doing put = ' + err);
            return(false);
          });
      }).catch((err) => {
        console.error('ERROR: AdminDataProvider: updateItem(): Error getting item to update, error = ', err);
        return(false);
      });
  }



  removeItem(id, rev)
  // Remove a specific item
  {
    let item = {_id: id, _rev: rev};

    // Remove the item's steps (annotations) from the database
    this.getItem(id).then((data:any)=>{
      // Remove each of the items's annotations
      for (var i = 0; i < data[0].media.length; i++) {
        this.getAnnotation(data[0].media[i]).then((data:any)=>{
          console.log('AdminDataProvider: removeItem(): About to remove annotation: ' + JSON.stringify(data));
          this.removeAnnotation(data[0].id, data[0].rev).then((result) => {
          });
        });
      }
    });

    return this._productDB.remove(item)
      .then((result)=>{
        return(true);
      })
      .catch((err) => {
        console.log('ERROR: AdminDataProvider: removeItem() _productDB.remove error is: ' + err);
        return(false);
      });
  }






  //=========================
  // ANNOTATIONS
  /*
   annotation
   id:		string
   type:		TEXT | PHOTO | VIDEO | AUDIO
   text:		string
   attachment:	<attachment>
   created:		datetime
   updated:		datetime
   */


  getAnnotation(id)
  // Gets a specific annotation
  {
    return this._productDB.get(id, {attachments: true})
      .then((doc) => {
        let item = [];
        // :TO DO: Add appropriate DataURIPrefix for Android
        let photoDataURIPrefix	= 'data:image/jpeg;base64,';
        let videoDataURIPrefix	= 'data:video/quicktime;base64,';
        let audioDataURIPrefix	= 'data:audio/wav;base64,';
        let attachment:any;
        let media:any;

        /*
         if(doc._attachments)
         {
         switch (doc.type) {
         case 'TEXT':
         attachment = {};
         break;
         case 'PHOTO':
         attachment = doc._attachments["annotation.jpg"].data;
         attachment = photoDataURIPrefix + attachment;
         console.log('Data: getAnnotation(): PHOTO attachment is: ' + JSON.stringify(attachment));
         break;
         case 'AUDIO':
         attachment = doc._attachments["annotation.wav"].data;
         attachment = audioDataURIPrefix + attachment;
         break;
         case 'VIDEO':
         attachment = doc._attachments["annotation.mov"].data;
         attachment = videoDataURIPrefix + attachment;
         break;
         default:
         attachment = {};
         break;
         }
         }
         else
         {
         console.log("data: getAnnotations: Annotation does not have an attachment (photo/audio/video)");
         }
         */

        media = "";

        switch (doc.type) {
          case 'PHOTO':
            media = photoDataURIPrefix + doc.media;
            //console.log('Data: getAnnotation(): PHOTO attachment is: ' + JSON.stringify(media));
            break;
          case 'AUDIO':
            media = audioDataURIPrefix + doc.media;
            break;
          case 'VIDEO':
            media = videoDataURIPrefix + doc.media;
            break;
          default:
            media = "";
            break;
        }


        item.push(
          {
            id: id,
            rev: doc._rev,
            type: doc.type,
            text: doc.text,
            media: media,
            //attachment: attachment,
            created: doc.created,
            updated: doc.updated
          });
        //console.log('getAnnotation: Found annotation: ' + JSON.stringify(item));
        return(item);
      })
      .catch((err)=>{
        return(false);
      });
  }



  getAnnotations(ids)
  // Get all of a user's annotations. ids is an array of database ids
  {
    console.log('AdminDataProvider: getAnnotations() recieved ids = ' + JSON.stringify(ids));

    // Remove any entries in the array of IDs that is false (which can happen if an error occurred during the creation of the annotation
    while(true){
      let index = ids.indexOf(false);
      if (index < 0) break;
      ids.splice(index, 1);
    }

    console.log('AdminDataProvider: getAnnotations() cleaned ids are = ' + JSON.stringify(ids));

    return this._productDB.allDocs({
      include_docs: true,
      keys: ids,
      attachments: true})

      .then((doc)=>{
        let k;
        let items = [];
        let row = doc.rows;

        // :TO DO: Add appropriate DataURIPrefix for Android

        let photoDataURIPrefix	= 'data:image/jpeg;base64,';
        let videoDataURIPrefix	= 'data:video/quicktime;base64,';
        let audioDataURIPrefix	= 'data:audio/wav;base64,';

        for (k in row) {

          let item = row[k].doc;
          let attachment:any;
          let media = "";

          if(item._attachments)
          {
            /*
             switch (item.type) {
             case 'TEXT':
             attachment = {};
             break;
             case 'PHOTO':
             //console.log("data: getAnnotations: Annotation has a photo attachment: " + JSON.stringify(item));
             attachment = item._attachments["annotation.jpg"].data;
             attachment = photoDataURIPrefix + attachment;
             break;
             case 'AUDIO':
             attachment = item._attachments["annotation.wav"].data;
             attachment = audioDataURIPrefix + attachment;
             break;
             case 'VIDEO':
             attachment = item._attachments["annotation.mov"].data;
             //let blob = this.b64toBlob(attachment, 'video/quicktime');
             //attachment = URL.createObjectURL(blob);
             //console.log('Data: getAnnotations(): Processing VIDEO created blob url = ' + attachment);
             attachment = videoDataURIPrefix + attachment;
             break;
             default:
             attachment = {};
             break;
             }
             */

            switch (item.type) {
              case 'PHOTO':
                media = photoDataURIPrefix + item.media;
                //console.log('Data: getAnnotation(): PHOTO attachment is: ' + JSON.stringify(media));
                break;
              case 'AUDIO':
                media = audioDataURIPrefix + item.media;
                break;
              case 'VIDEO':
                media = videoDataURIPrefix + item.media;
                break;
              default:
                media = "";
                break;
            }


          }
          else
          {
            //console.log("data: getAnnotations: Annotation does not have an attachment (photo/audio/video)");
          }

          let newItem =
            {
              id: item._id,
              rev: item._rev,
              type: item.type,
              text: item.text,
              media: media,
              created: item.created,
              updated: item.updated,

            };

          items.push(newItem);
        }
        //console.log('Data: getAnnotations(): allDocs() about to return items = ' + JSON.stringify(items));

        return(items);
      })
      .catch((err)=>{
        console.log('ERROR: AdminDataProvider: getAttachments(): allDocs() err = ' + JSON.stringify(err));
        return(false);
      });
  }



  addAnnotation(type, text, attachment)
  // Add a new annotation
  {

    // :TO DO: Add appropriate media types for Android (check latest PowerUp

    console.log('AdminDataProvider: addAnnotation() called with type = ' + type + ', and attachment = ' + JSON.stringify(attachment));
    /*
     let attachmentData: any;
     let base64String:   any;
     switch (type) {
     case 'PHOTO':
     attachmentData = {
     "annotation.jpg" : {
     content_type 	: 'image/jpeg',
     data 			    : attachment
     }
     };
     //console.log('Data: addAnnnotation: PHOTO attachment is:  ' + attachmentData);
     break;

     case 'VIDEO':
     attachmentData = {
     "annotation.mov" : {
     content_type 	: 'video/quicktime',
     data 			    : attachment
     }
     };
     //console.log('Data: addAnnnotation: VIDEO attachment is:  ' + JSON.stringify(attachmentData));
     break;

     case 'AUDIO':
     attachmentData = {
     "annotation.wav" : {
     content_type 	: 'audio/wav',
     data 			    : attachment
     }
     };
     //console.log('addAnnnotation: AUDIO attachment is:  ' + JSON.stringify(attachmentData));
     break;

     case 'TEXT':
     console.log('addAnnnotation: processing attachmentType TEXT');
     attachmentData = {

     };
     break;

     default:
     console.log('addAnnnotation: processing attachmentType none');
     attachmentData = {

     };
     break;

     }
     */

    let timeStamp = new Date().toISOString();
    let annotation = {
      _id: 'ANNOTATION:' + timeStamp,
      type: type,
      text: text,
      media: attachment,
      //_attachments: attachmentData,
      created: timeStamp,
      updated: timeStamp
    };

    console.log('AdminDataProvider: addAnnotation(): About to put: ' + JSON.stringify(annotation));
    return this._productDB.put(annotation)
      .then(function (response) {
        console.log('addAnnotation: Put returned - ' + JSON.stringify(response));
        return response.id;
      })
      .catch((err) => {
        console.log('AdminDataProvider: addAnnotation(): Error: ' + err);
        return false;
      });
  }



  updateAnnotation(id, type, text, media)
  // Amend an existing annotation
  {
    // Get from the DB the annotation we want to change to make sure we have the most up to date rev
    this.getAnnotation(id)
      .then((item: any) => {
        let now = new Date().toISOString();
        let annotation = {
          _id: id,
          _rev: item[0].rev,
          type: type,
          text: text,
          media: media,
          //attachment     : file,
          created: item[0].created,
          updated: now
        };

        return this._productDB.put(annotation)
          .then((result)=>{
            return(true);
          })
          .catch((err) => {
            console.log('ERROR: AdminDataProvider: updateAnnotation(): Error doing put = ' + err);
            return(false);
          });
      })
      .catch((err) => {
        console.error('ERROR: AdminDataProvider: updateAnnotation() Error getting item to update, error is: ', err);
        return(false);
      });
  }



  removeAnnotation(id, rev)
  // Remove a specific annotation
  {
    let annotation = {_id: id, _rev: rev};

    return this._productDB.remove(annotation)
      .then((result)=>{
        return(true);
      })
      .catch((err) => {
        console.log('ERROR: AdminDataProvider: removeAnnotation() error is: ' + err);
        return(false);
      });
  }



  b64toBlob(b64Data, contentType='', sliceSize=512)
  // NOT currently used
  {
    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    let blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }



  //=============================================
  // ENCRYPTION


  encryptData(data)
  // Encrypts PouchDB data in preparation for a Put.
  {
    if (!ENCRYPT_DATA) return data;

    let encryptedField:any;
    let password = this.encryptKey;
    let fieldToStringify = this.nonStringFields;

    console.log('+++++ AdminDataProvider: encryptData(): data in is: ' + JSON.stringify(data));
    Object.keys(data).forEach(function (field) {
      if (field !== '_id'
        && field !== 'id'
        && field !== '_rev'
        && field !== 'rev'
        && field !== '_attachments'
        && field !== 'created'
        && field !== 'updated') {
        if (data[field] != "" && data[field] != null)
        {
          console.log('+++++ AdminDataProvider: encryptData(): About to encrypt data[' + field + '] = ' + data[field]);


          // For non string fields we have to JSON.stringify them
          let str:string = field;
          console.log('$$$$$ AdminDataProvider: encryptData(): ' + field + ' index in nonStringFields is: ' + fieldToStringify.indexOf(str));
          if (fieldToStringify.indexOf(str) != -1) {
            console.log('+++++ encryptData(): ' + field + ' is in array of nonStringFields so going to stringify');
            encryptedField = CryptoJS.AES.encrypt(JSON.stringify(data[field]), password);
          }
          else {
            console.log('+++++ AdminDataProvider: encryptData(): ' + field + ' is NOT in array of nonStringFields so NOT going to stringify');
            encryptedField = CryptoJS.AES.encrypt(data[field], password);
          }

          console.log('+++++ AdminDataProvider: encryptData: encryptedField.toString = ' + encryptedField.toString());

          data[field] = encryptedField.toString();

          console.log('+++++ AdminDataProvider: encryptData: encrypted data[field] is now = ' + data[field]);
        }
      }
    });
    console.log('+++++ Done AdminDataProvider: encryptData() with data = ' + JSON.stringify(data));
    return data;
  }



  decryptData(data)
  // Decrypts PouchDB data that has just been returned by a Get or Alldocs
  {
    if (!ENCRYPT_DATA) return data;

    let password = this.encryptKey;
    let fieldToParse = this.nonStringFields;

    console.log('+++++ AdminDataProvider: decryptData(): data in is: ' + JSON.stringify(data));
    Object.keys(data).forEach(function (field) {
      if (field !== '_id'
        && field !== 'id'
        && field !== '_rev'
        && field !== 'rev'
        && field !== '_attachments'
        && field !== 'created'
        && field !== 'updated')
      {

        data[field] = CryptoJS.AES.decrypt(data[field], password);
        console.log('+++++ AdminDataProvider: decryptData(): CryptoJS.AES.decrypt for data[' + field + '] = ' + data[field]);

        data[field] = data[field].toString(CryptoJS.enc.Utf8);
        console.log('+++++ AdminDataProvider: decryptData(): data[' + field + '] after toString is now = ' + data[field]);

        // If the field is a non string field we must parse the JSON
        let str:string = field;

        if (fieldToParse.indexOf(str) != -1) {
          console.log('+++++ AdminDataProvider: decryptData(): About to parse non string field: data[' + field + '] = ' + data[field]);
          if (typeof data[field] != "undefined" && data[field] != null && data[field].length > 0) data[field] = JSON.parse(data[field]);
          else data[field] = [];
          console.log('$$$$$ AdminDataProvider: decryptData(): After possibly parsing JSON data[' + field + '] = ' + JSON.stringify(data[field]));
        }
      }
    });
    console.log('+++++ AdminDataProvider: Done decryptData() about to return decrypted data = ' + JSON.stringify(data));
    return data;
  }


}
