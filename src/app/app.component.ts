import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, Config, AlertController, Events } from 'ionic-angular';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AppVersion } from '@ionic-native/app-version';
import { NativeStorage } from '@ionic-native/native-storage';

/*
import { HomePage } from '../pages/home/home';
import { ProductsPage } from '../pages/products/products';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { WelcomePage } from '../pages/welcome/welcome';
*/

import { DataProvider } from '../providers/data';
import { AuthenticationProvider } from '../providers/authentication';
import { CommonFunctionsProvider } from '../providers/common-functions';
import { ConnectivityService } from '../providers/connectivity-service';
import { LocalStorageProvider } from '../providers/local-storage';

import { OneSignal } from '@ionic-native/onesignal';

import { APP_NAME, SKIP_SECURESTORAGE, ENCRYPT_DATA, DO_LOGIN } from '../app/app.settings';


import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'app.html'
})
export class VanillaApp {
  rootPage:any = 'TabsPage';
  //rootPage = WelcomePage;

  @ViewChild(Nav) nav: Nav;


  appVersionNumber:   string = '';
  isAdminUser: boolean = false;

  constructor(public translate: TranslateService,
              public platform: Platform,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen,
              public commonFunctionsProvider: CommonFunctionsProvider,
              public dataProvider: DataProvider,
              public authenticationProvider: AuthenticationProvider,
              public localStorageProvider: LocalStorageProvider,
              public nativeStorage: NativeStorage,
              public connectivityService: ConnectivityService,
              public alertCtrl: AlertController,
              public config: Config,
              public events: Events,
              public oneSignal: OneSignal,
              private appVersion: AppVersion) {

    console.log('VanillaApp constructor running');

    // Set the default language for translation strings, and the current language.
    translate.setDefaultLang('en');
    translate.use('en');

    translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });

    console.log('VanillaApp about to call initializeApp');

    this.initializeApp();

    console.log('VanillaApp about to call addConnectivityListeners');

    this.addConnectivityListeners();
/*
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
*/
  }



  initializeApp()
  // Checks what needs to be done to start the App depending on whether or not this is the first
  // time the App is being used and whether or not we have an internet connection
  {
    console.log('VanillaApp: initializeApp() called');

    this.platform.ready().then(() => {

      console.log('VanillaApp: Platform ready!');

      //this.statusBar.overlaysWebView(false); // let status bar overlay webview
      //this.statusBar.backgroundColorByHexString('#fa1cff');
      this.statusBar.styleLightContent();
      this.splashScreen.hide();

      // Are we running on a device or in the browser?
      if (this.platform.is('cordova'))
      {
        console.log('VanillaApp: Running on a Cordova device');

        // Setup list of pins etc. in LocalStorageProvider
        this.localStorageProvider.init();

        //this.oneSignal.setLogLevel({logLevel: 6, visualLevel: 4});
        // NOTE: To test this on Android we MUST build the APK file and install on an Android phone
        this.oneSignal.startInit('73205d7d-b2a8-40ad-9f62-5ad8234360f6', '1090877567336');

        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

        this.oneSignal.handleNotificationReceived().subscribe(() => {
          // do something when notification is received
        });

        this.oneSignal.handleNotificationOpened().subscribe(() => {
          // do something when a notification is opened
        });

        this.oneSignal.endInit();


        // :TO DO: Use the version number in the menu
        // Can only run getVersionNumber on an actual device
        this.appVersion.getVersionNumber().then((result) => {
          console.log('VanillaApp: Constructor: getVersionNumber returned = ' + result);
          this.appVersionNumber = result;
        });
      }
      else {
        // We are running in the browser so can't use the locally stored settings
        console.log('VanillaApp: NOT running on Cordova device');
      }

      if (DO_LOGIN) this.nav.setRoot('WelcomePage'); // :TO DO: Check login stuff is still working!
      else {
        // If we aren't making users login we need to initialise the dataProvider here (rather than within the login code)

        // First check if user is an admin so we can call the DB init with the admin password
        if (this.platform.is('cordova')) {
          this.nativeStorage.getItem('adminPassword')
            .then(
              data => {
                console.log('VanillaApp: Constructor: getItem("adminPassword"): get from local storage = ' + data);
                if (data != "") {
                  this.commonFunctionsProvider.isAdminUser = true;
                  this.dataProvider.init(data);
                }
                else {
                  this.commonFunctionsProvider.isAdminUser = false;
                  this.dataProvider.init(null);
                }
              },
              error => {
                console.log('VanillaApp: Constructor: getItem("adminPassword"): get from local storage ERROR = ' + error);
                this.commonFunctionsProvider.isAdminUser = false;
                this.dataProvider.init(null);
              }
            );
        }
        else { // We are running via ionic serve
          this.dataProvider.init(null);
          //this.commonFunctionsProvider.isAdminUser = true;
          //this.dataProvider.init('1234'); // :TO DO: :TEMP: Allows us to add products using ionic serve
        }
        //this.nav.setRoot(HomePage);
      }
    });
  }



  addConnectivityListeners()
  // Listen to online/offline status and react accordingly
  // NOT CURRENTLY USED
  {
    let onOnline = () =>
      // Called every time the App goes online
    {
      // Do something
    };

    let onOffline = () =>
      // Called every time the App goes offline
    {
      // Do something
    };

    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
  }



  logout()
  {
    this.authenticationProvider.logout();
    this.nav.setRoot('WelcomePage');
  }



  openPage(page)
  {
    //this.nav.setRoot(page.component, {'keyword': 'ALL'});
  }
}
