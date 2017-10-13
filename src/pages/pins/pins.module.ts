import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PinsPage } from './pins';

@NgModule({
  declarations: [
    PinsPage,
  ],
  imports: [
    IonicPageModule.forChild(PinsPage),
  ],
})
export class PinsPageModule {}
