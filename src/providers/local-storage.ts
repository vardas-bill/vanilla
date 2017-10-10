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
  shownNoPinsMessage: boolean = false;

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
          console.log('LocalStorageProvider: init(): getItem("pins"): get from local storage = ' + data);
          this.pins = JSON.parse(data);
        },
        error => {
          // This will happen if no pins have been stored yet
          console.log('LocalStorageProvider: init(): getItem("pins"): get from local storage ERROR = ' + error);
          this.pins = [];
        }
      );

    this.nativeStorage.getItem('shownNoPinMessage')
      .then(
        data => {
          this.shownNoPinsMessage = false;
        },
        error => {
          this.shownNoPinsMessage = true;
        }
      );
  }



  doneNoPinsMessage()
  // Sets storage item to true to indicate the noPinsMessage doesn't need to be shown
  {
    this.nativeStorage.setItem('shownNoPinMessage', 'true')
      .then(
        data => {
          this.shownNoPinsMessage = false;
        },
        error => {
          this.shownNoPinsMessage = true;
        }
      );
  }


  showNoPinsMessage()
  // Tells the caller whether or not the no pins message needs to be shown (i.e. that is hasn't been shown yet)
  {
    return this.shownNoPinsMessage
  }



  // ========
  // PINS
  //

  addPin(itemID)
  // Adds a new item to the user's list of pinned items
  {
    console.log('LocalStorageProvider: addPin(): called with itemID = ' + itemID);

    // Get the user's current list of pins (the IDs of the pinned items)
    return this.nativeStorage.getItem('pins')
      .then(
        data => {
          console.log('LocalStorageProvider: addPin(): getItem("pins"): get from local storage = ' + data);

          if (data != "" && data != null) {

            this.pins = JSON.parse(data);

            // Go through the list and check the itemID is not already pinned
            if (this.pins != []) {
              this.pins.forEach((id)=>{
                if (id == itemID) {
                  console.log('LocalStorageProvider: addPin(): getItem("pins"): data != "" && data != null: item is already pinned! = ');
                  return;
                }
              });
              this.pins.push(itemID);
            }
            else {
              this.pins = [itemID];
            }
          }
          else {
            this.pins = [itemID];
          }

          console.log('LocalStorageProvider: addPin(): getItem("pins"): about to setItem with this.pins = ' + JSON.stringify(this.pins));

          this.nativeStorage.setItem('pins', JSON.stringify(this.pins))
            .then(
              () => {},
              error => {}
            );

          return;
        },
        error => {
          // This will happen if no pins have been stored yet
          console.log('LocalStorageProvider: addPin(): getItem("pins"): get from local storage ERROR = ' + error);

          this.pins = [itemID];

          console.log('LocalStorageProvider: addPin(): getItem("pins"): about to nativeStorage.setItem(this.pins) with this.pins = ' + JSON.stringify(this.pins));
          this.nativeStorage.setItem('pins', JSON.stringify(this.pins))
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

          if (data != "") {

            let thePins: any = JSON.parse(data);

            // Go through the list and remove the pinned item
            for (var i = 0; i < thePins.length; i++) {
              if (thePins[i] == itemID) {
                // Remove this pin
                thePins.splice(i, 1);
              }
            }

            this.pins = thePins;

            this.nativeStorage.setItem('pins', JSON.stringify(this.pins))
              .then(
                () => {},
                error => {}
              );
          }

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
        console.log('LocalStorageProvider: isPinned(): returning = true');

        return true;
      }
    }
    console.log('LocalStorageProvider: isPinned(): returning = false');
    return false;
  }

}
