import { NgModule } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { Geolocation, Keyboard } from 'ionic-native';
import { Http, Response } from '@angular/http'; import { WeatherProvider } from '../../providers/WeatherProvider';
import { CompleteService } from '../../providers/CompleteService';
import { MongolabDataApi } from '../../providers/MongolabDataApi'; import { AlertController, LoadingController, NavController, Platform } from 'ionic-angular';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    degreeStr: string = ' degrees (C)';
    currentLoc: any = {};
    cItems: Array<any> = [];
    @ViewChild('searchbar')
    searchbar: any;
    documents: Array<any> = [];

    constructor(public alertController: AlertController,
        public loadingCtrl: LoadingController,
        public platform: Platform,
        public navCtrl: NavController,
        public http: Http,
        public weather: WeatherProvider,
        public mongoApi: MongolabDataApi,
        public completeService: CompleteService) {

        mongoApi.loadDocs()
            .then((data: any) => {
                this.documents = [];
                this.documents = data.json();
                this.documents.forEach((doc) => {
                    doc['checked'] = false;
                });
            });
    }

    private handleError(res: Response | any) {
        console.error('Entering handleError');
        console.dir(res);
        return Promise.reject(res.message || res);
    }

    refrehsAreas() {
        
    }

    setCityName() {
        Keyboard.close();
        this.currentLoc = {
            'name': this.searchbar.getValue()
        };
        this.showCurrent();
    }

    onLink(url: string) {
        window.open(url);
    }

    ionViewDidLoad() {
        this.platform.ready()
            .then(() => {
                document.addEventListener('resume',
                    () => {
                        this.getLocalWeather();
                    });
                this.getLocalWeather();
            });
    }

    refreshPage() {
        this.showCurrent();
    }

    getLocalWeather() {
        let locOptions = { 'maximumAge': 3000, 'timeout': 5000, 'enableHighAccuracy': true };
        Geolocation.getCurrentPosition(locOptions)
            .then(pos => {
                this.currentLoc = { 'lat': pos.coords.latitude, 'long': pos.coords.longitude };
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
        this.cItems = [];
        let loader = this.loadingCtrl.create({
            content: "Retrieving current conditions..."
        });
        loader.present();
        this.weather.getCurrent(this.currentLoc)
            .then(
                data => {
                    loader.dismiss();
                    if (data) {
                        this.cItems = this.formatWeatherData(data);
                    } else {
                        console.error('Error retrieving weather data: Data object is empty');
                    }
                },
                error => {
                    loader.dismiss();
                    console.error('Error retrieving weather data');
                    console.dir(error);
                    this.showAlert(error);
                }
            );
    }

    private formatWeatherData(data): any {
        let tmpArray = [];
        if (data.name) {
            tmpArray.push({ 'name': 'Location', 'value': data.name });
        }
        tmpArray.push({ 'name': 'Temperature', 'value': data.main.temp + this.degreeStr });
        tmpArray.push({ 'name': 'Low', 'value': data.main.temp_min + this.degreeStr });
        tmpArray.push({ 'name': 'High', 'value': data.main.temp_max + this.degreeStr });
        tmpArray.push({ 'name': 'Humidity', 'value': data.main.humidity + '%' });
        tmpArray.push({ 'name': 'Pressure', 'value': data.main.pressure + ' hPa' });
        tmpArray.push({ 'name': 'Wind', 'value': data.wind.speed + ' mph' });
        if (data.visibility) {
            tmpArray.push({ 'name': 'Visibility', 'value': data.visibility + ' meters' });
        }
        if (data.sys.sunrise) {
            var sunriseDate = new Date(data.sys.sunrise * 1000);
            tmpArray.push({ 'name': 'Sunrise', 'value': sunriseDate.toLocaleTimeString() });
        }
        if (data.sys.sunset) {
            var sunsetDate = new Date(data.sys.sunset * 1000);
            tmpArray.push({ 'name': 'Sunset', 'value': sunsetDate.toLocaleTimeString() });
        }
        if (data.coord) {
            tmpArray.push({ 'name': 'Latitude', 'value': data.coord.lat });
            tmpArray.push({ 'name': 'Longitude', 'value': data.coord.lon });
        }
        return tmpArray;
    }

    showAlert(message: string) {
        let alert = this.alertController.create({
            title: 'Error',
            subTitle: 'Source: Weather Service',
            message: message,
            buttons: [{ text: 'Sorry' }]
        });
        alert.present();
    }
}