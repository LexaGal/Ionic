import { NgModule } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { Geolocation, Keyboard } from 'ionic-native';
import { Http, Response, Headers } from '@angular/http';
import { FormsModule } from "@angular/forms";
import { Storage } from "@ionic/storage";
import { DatePipe } from '@angular/common';

import * as createHash from '../../../node_modules/sha.js';

//sha512 = createHash('sha512');//public sha: jsSHA,
//'sha.js'; ////'crypto-js';//@types/jssha';//import {jsSHA} from '@types/jssha';//import {jsSHA} from '@types/jssha';

import { WeatherProvider } from '../../providers/WeatherProvider';
import { CompleteService } from '../../providers/CompleteService';
import { MongolabDataApi } from '../../providers/MongolabDataApi';

import { AlertController, LoadingController, NavController, Platform, App } from 'ionic-angular';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
    providers: [Storage, DatePipe]
})

export class HomePage {
    degreeStr: string = ' degrees (C)';
    currentLoc: any = {};

    weatherItems: Array<any> = [];

    documents: Array<any> = [];

    @ViewChild('searchbar')
    searchbar: any;

    loggedIn: boolean = false;
    loginFail: boolean = false;

    isHistory: boolean = false;
    historyItems: Array<any> = [];

    currHistoryItemsData: Array<any> = [];

    private baseServerUr: string = "http://qwertyuiop1.azurewebsites.net/";

    private apis: any = {
        setWeather: 'api/weather/set'
    }

    user = {
        email: 'galushkin.aleksey@gmail.com',
        password: 'qYYfO8Di12345!'
    }

    currUser = {};

    constructor(public alertController: AlertController,
        public loadingCtrl: LoadingController,
        public platform: Platform,
        public navCtrl: NavController,
        public form: FormsModule,
        public http: Http,
        public store: Storage,
        public weather: WeatherProvider,
        public mongoApi: MongolabDataApi,
        public completeService: CompleteService,
        private datePipe: DatePipe) {
    }

    goToMainPage() {
        this.isHistory = false;
    }

    goToHistory() {
        //this.historyItems.clear();
        this.historyItems = [];
        this.store.forEach((v, k) => {
            this.historyItems.push({ key: k, value: v });
        }).then(() => {
            this.isHistory = true;
        });
    }

    cleanHistory() {
        this.store.clear().then(() => {
            this.showAlert('', 'All history was removed.', 'Plants App.', 'Good');
        });
        this.historyItems = [];
        this.currHistoryItemsData = [];
    }

    viewItems(item) {
        this.currHistoryItemsData = item.WeatherItems;
    }

    removeItems(item) {
        this.store.remove(item.City.name + item.Date)
            .then(() => this.showAlert('','Removed', '', 'Good'));
        var elem = this.historyItems.filter(o => o.key === item.City.name + item.Date)[0];
        var i = this.historyItems.indexOf(elem);                this.historyItems.splice(i, 1);            this.currHistoryItemsData = [];
    }

    //._setDisableScroll(false);
    //    this.app.setScrolling();
    //}

    private handleError(res: Response | any) {
        console.error('Entering handleError');
        console.dir(res);
        return Promise.reject(res.message || res);
    }

    logInSubmit() {
        var sha256 = createHash('sha256');
        var hash = sha256.update(this.user.password, 'utf8').digest('hex');

        //console.log(h);
        //{//TemplateBased() {his}//logIn() {

        this.mongoApi.loadUsers()
            .then((data: any) => {
                var users = data.json()
                    .filter(u => {
                        return u.email === this.user.email &&
                            u.passwordToken === hash; //this.user.password;
                    });
                if (users.length === 1) {
                    this.loggedIn = true;
                    this.currUser = users[0];
                    //this.getLocalWeather();
                    this.refreshAreas();
                } else {
                    this.loginFail = true;
                }
            });
    }

    logOut() {
        this.loggedIn = false;
        this.currUser = this.user;
    }

    refreshAreas() {
        let loader = this.loadingCtrl.create({
            content: "Refreshing your plants areas..."
        });
        loader.present();
        this.mongoApi.loadDocs()
            .then((data: any) => {
                this.documents = [];
                this.documents = data.json();
                this.documents.forEach((doc) => {
                    doc['checked'] = false;
                });
                loader.dismiss();
            });
    }

    sendWeather() {
        let docs = this.documents.filter(item => item.checked);

        if (docs.length === 0) {
            this.showAlert('Please, select any areas', 'Data was not sent', 'Plants App.', 'Good');
            return;
        }

        if (this.weatherItems.length === 0) {
            this.showAlert('Please, load any weather', 'Data was not sent', 'Plants App.', 'Good');
            return;
        }

        let data = {
            AreasIds: docs.map(item => item._id),
            WeatherItems: this.weatherItems.map(item =>
                ({
                    Name: item.Name,
                    Value: typeof item.Value !== 'string' ? JSON.stringify(item.Value) : item.Value
                }))
        };
        var params = JSON.stringify(data);

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let loader = this.loadingCtrl.create({
            content: "Sending weather conditions..."
        });
        loader.present();
        this.http.post(this.baseServerUr + this.apis.setWeather,
            params, {
                headers: headers
            })
            .toPromise()
            .then((resp) => {
                this.refreshAreas();
                this.showAlert(resp.status === 200 ? 'Success' : resp.statusText, 'Data was sent', 'Plants App.', 'Good');
                var weather = {
                    City: this.currentLoc,
                    WeatherItems: this.weatherItems,
                    Date: Date.now()//this.datePipe.transform(Date.now(), 'yyyy-MM-dd, HH:mm')
                }
                //alert(.toLocaleString()); //""this.datePipe.transform(, 'yyyy-MM-dd, HH:mm'));
                this.store.set(weather.City.name + weather.Date, weather)
                    .then(() => {
                        loader.dismiss();
                    });
                //console.log(this.store.keys().length);
            })
            .catch(this.handleError);
    }

    setCityName(name) {
        Keyboard.close();
        this.currentLoc = {
            'name': name ? name : this.searchbar.getValue()
        };
        if (this.currentLoc.name !== null) {
            this.showCurrent();
        }
    }

    onLink(url: string) {
        window.open(url);
    }

    //ionViewDidLoad() {
    //    this.platform.ready()
    //        .then(() => {
    //            document.addEventListener('resume',
    //                () => {
    //                    this.getLocalWeather();
    //                });
    //            this.getLocalWeather();
    //        });
    //}

    refreshPage() {
        this.showCurrent();
    }

    getLocalWeather() {
        let locOptions = { 'maximumAge': 3000, 'timeout': 5000, 'enableHighAccuracy': true };
        Geolocation.getCurrentPosition(locOptions)
            .then(pos => {
                this.currentLoc = //{'name' : "Hrodna"}
                    { 'lat': pos.coords.latitude, 'long': pos.coords.longitude };
                this.showCurrent();
            })
            .catch(e => {
                console.error('Unable to determine current location');
                if (e) {
                    console.log('%s: %s', e.code, e.message);
                    console.dir(e);
                }
            });
    }

    showCurrent() {
        this.weatherItems = [];
        let loader = this.loadingCtrl.create({
            content: "Retrieving current conditions..."
        });
        loader.present();
        this.weather.getCurrent(this.currentLoc)
            .then(
            data => {
                loader.dismiss();
                if (data) {
                    this.weatherItems = this.formatWeatherData(data);
                } else {
                    console.error('Error retrieving weather data: Data object is empty');
                }
            },
            error => {
                loader.dismiss();
                console.error('Error retrieving weather data');
                console.dir(error);
                this.showAlert(error, 'Error', 'Source: Open Weather', 'Close');
            }
            );
    }

    private formatWeatherData(data): any {
        let tmpArray = [];
        if (data.name) {
            tmpArray.push({ 'Name': 'Location', 'Value': data.name });
        }
        tmpArray.push({ 'Name': 'Temperature', 'Value': data.main.temp, 'Ext': this.degreeStr });
        tmpArray.push({ 'Name': 'Low', 'Value': data.main.temp_min, 'Ext': this.degreeStr });
        tmpArray.push({ 'Name': 'High', 'Value': data.main.temp_max, 'Ext': this.degreeStr });
        tmpArray.push({ 'Name': 'Humidity', 'Value': data.main.humidity, 'Ext': ' %' });
        tmpArray.push({ 'Name': 'Pressure', 'Value': data.main.pressure, 'Ext': ' hPa' });
        tmpArray.push({ 'Name': 'Wind', 'Value': data.wind.speed, 'Ext': ' mph' });
        if (data.visibility) {
            tmpArray.push({ 'Name': 'Visibility', 'Value': data.visibility, 'Ext': ' meters' });
        }
        if (data.sys.sunrise) {
            var sunriseDate = new Date(data.sys.sunrise * 1000);
            tmpArray.push({ 'Name': 'Sunrise', 'Value': sunriseDate.toLocaleTimeString() });
        }
        if (data.sys.sunset) {
            var sunsetDate = new Date(data.sys.sunset * 1000);
            tmpArray.push({ 'Name': 'Sunset', 'Value': sunsetDate.toLocaleTimeString() });
        }
        if (data.coord) {
            tmpArray.push({ 'Name': 'Latitude', 'Value': data.coord.lat });
            tmpArray.push({ 'Name': 'Longitude', 'Value': data.coord.lon });
        }
        return tmpArray;
    }

    showAlert(message: string, title: string, source: string, buttonText: string) {
        let alert = this.alertController.create({
            title: title,
            subTitle: source,
            message: message,
            buttons: [{ text: buttonText }]
        });
        alert.present();
    }
}