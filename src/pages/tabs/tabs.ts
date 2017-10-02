import { Component, ViewChild } from '@angular/core';
import { Tabs } from 'ionic-angular';

import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { PinsPage } from '../pins/pins';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('vanillaTabs') tabRef: Tabs;

  tab1Root = HomePage;
  tab2Root = PinsPage;
  tab3Root = HomePage;
  tab4Root = HomePage;
  tab5Root = ContactPage;

  constructor() {

  }

}
