// Global settings for app such as the server to be used for API calls

//export var SUPERLOGIN_SERVER = 'http://127.0.0.1:3000';



// LOCAL TEST SERVER (For testing via browser)
/*
export const SUPERLOGIN_SERVER = 'http://127.0.0.1:3000';
export const COUCHDB_SERVER = 'http://127.0.0.1:5984';
export const COUCHDB_SERVER_URL = '127.0.0.1:5984';
export const COUCHDB_PASSWORD = '';
export const COUCHDB_USER = '';
export const REMOTE_SERVER = false;
*/


// LOCAL TEST SERVER (For testing via App running on a device)
export var SUPERLOGIN_SERVER = 'http://fa7c4ed1.ngrok.io';
export var COUCHDB_SERVER = 'http://fd6cbc73.ngrok.io';
export var COUCHDB_SERVER_URL = 'fd6cbc73.ngrok.io';
export var REMOTE_SERVER = false;
export const COUCHDB_PASSWORD = '';
export const COUCHDB_USER = '';


// AWS TEST SERVER
/*
export var SUPERLOGIN_SERVER = 'http://ec2-35-157-74-47.eu-central-1.compute.amazonaws.com:3000';
export var COUCHDB_SERVER = 'http://ec2-35-157-74-47.eu-central-1.compute.amazonaws.com:5984';
export var COUCHDB_SERVER_URL = 'ec2-35-157-74-47.eu-central-1.compute.amazonaws.com:5984';
export var REMOTE_SERVER = true;
 */


// PRODUCTION SERVER
/*
export var SUPERLOGIN_SERVER = 'http://185.83.120.50:3000';
export var COUCHDB_SERVER = 'http://185.83.120.50:5984';
export var COUCHDB_SERVER_URL = '185.83.120.50:5984';
export var REMOTE_SERVER = true;
*/

// When running ionic serve -lab we can't use SecureStorage so for testing purposes we skip code that uses it!
export const SKIP_SECURESTORAGE = false;
export const ENCRYPT_DATA = false; // Says whether or not PouchDB/CouchDB data gets encrypted

export const APP_NAME = 'VanillaApp';
export const PRODUCT_DB_NAME = 'product';
export const DO_LOGIN = false;
export const FB_LINK = 'fb://profile/143148719116222';
export const TW_LINK = 'https://twitter.com/DigHaushizzle';
export const INSTAGRAM_LINK = 'https://www.instagram.com/dig_haushizzle/';

export const PRODUCT_CATEGORY1_SUBCATEGORIES = [];
export const PRODUCT_CATEGORY2_SUBCATEGORIES = [];
export const PRODUCT_CATEGORY3_SUBCATEGORIES = [];
export const PRODUCT_CATEGORY4_SUBCATEGORIES = [];
export const PRODUCT_CATEGORY5_SUBCATEGORIES = [];
export const PRODUCT_CATEGORY6_SUBCATEGORIES = [];

export const MAJOR_CATEGORY_BUTTON = [
  {'show':true, 'name':'Furniture', 'keyword':'furniture', 'pageTitle':'Craft Beers', 'backgroundColor': '#9BA0B2', 'textColor': 'white', 'image': ''},
  {'show':true, 'name':'Bright Lights', 'keyword':'lights', 'pageTitle':'Craft Lager', 'backgroundColor': '#89B3B2', 'textColor': 'white', 'image': ''},
  {'show':true, 'name':'', 'keyword':'ALL', 'pageTitle':'Stuff', 'backgroundColor': '#434343', 'textColor': 'black', 'image': 'assets/img/square_logo.png'},
  {'show':true, 'name':'Printed', 'keyword':'printed', 'pageTitle':'Craft Water', 'backgroundColor': '#BED3B2', 'textColor': 'white', 'image': ''},
  {'show':true, 'name':'Misfits', 'keyword':'misfits', 'pageTitle':'Craft Whisky', 'backgroundColor': '#BDA6A3', 'textColor': 'white', 'image': ''}
]



