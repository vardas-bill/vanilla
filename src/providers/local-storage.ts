import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { NativeStorage } from '@ionic-native/native-storage';
import { APP_NAME, SKIP_SECURESTORAGE, ENCRYPT_DATA } from '../app/app.settings';


/*
 Provider for wrapper functions for secure storage
 */

@Injectable()
export class LocalStorageProvider {

  pins: any = [];

  constructor(public nativeStorage: NativeStorage)
  {
    console.log('Hello LocalStorageProvider');
  }


  init()
  {
    // Get the user's current list of pins (the IDs of the pinned items) and put in pins variable
    this.nativeStorage.getItem('pins')
      .then(
        data => {
          console.log('LocalStorageProvider: Constructor: getItem("pins"): get from local storage = ' + data);
          this.pins = data;
        },
        error => {
          // This will happen if no pins have been stored yet
          console.log('LocalStorageProvider: Constructor: getItem("pins"): get from local storage ERROR = ' + error)
          this.pins = [];
        }
      );
  }

  // ========
  // PINS
  //

  addPin(itemID)
  // Adds a new item to the user's list of pinned items
  {
    // Get the user's current list of pins (the IDs of the pinned items)
    return this.nativeStorage.getItem('pins')
      .then(
        data => {
          console.log('LocalStorageProvider: addPin(): getItem("pins"): get from local storage = ' + data);

          // Go through the list and check the itemID is not already pinned
          data.forEach(function(id){
            if (id == itemID) return;
          });

          data.append(itemID);

          this.pins = data;

          this.nativeStorage.setItem('pins', data)
            .then(
              () => {},
              error => {}
            );

          return;
        },
        error => {
          // This will happen if no pins have been stored yet
          console.log('LocalStorageProvider: addPin(): getItem("pins"): get from local storage ERROR = ' + error);
          let data:any = [itemID];

          this.pins = data;

          this.nativeStorage.setItem('pins', data)
            .then(
              () => {},
              error => {}
            );

          return;
        }
      );

  }


  removePin(itemID)
  // Removes a pinned item from the user's list of pinned items
  {
    // Get the user's current list of pins (the IDs of the pinned items)
    return this.nativeStorage.getItem('pins')
      .then(
        data => {
          console.log('LocalStorageProvider: removePin(): getItem("pins"): get from local storage = ' + data);

          // Go through the list and check the itemID is not already pinned
          for (var i = 0; i < data.length; i++) {
            if (data[i] == itemID) {
              // Remove this pin
              data.splice(i, 1);
            }
          }

          this.pins = data;

          this.nativeStorage.setItem('pins', data)
            .then(
              () => {},
              error => {}
            );

          return;
        },
        error => {
          // This will happen if no pins have been stored yet so ignore request to remove pin
          console.log('LocalStorageProvider: removePin(): getItem("pins"): get from local storage ERROR = ' + error)

          return;
        }
      );
  }



  isPinned(itemID)
  // Returns true if itemID has been pinned
  {
    // Go through the list and check the itemID is not already pinned
    for (var i = 0; i < this.pins.length; i++) {
      if (this.pins[i] == itemID) {
        return true;
      }
    }

    return false;
  }

}
