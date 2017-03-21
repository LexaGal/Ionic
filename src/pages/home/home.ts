import { NgModule } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { Geolocation, Keyboard } from 'ionic-native';
import { Http, Response, Headers } from '@angular/http';

import { WeatherProvider } from '../../providers/WeatherProvider';
import { CompleteService } from '../../providers/CompleteService';
import { MongolabDataApi } from '../../providers/MongolabDataApi';

import { AlertController, LoadingController, NavController, Platform } from 'ionic-angular';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    degreeStr: string = ' degrees (C)';
    currentLoc: any = {};

    weatherItems: Array<any> = [];
    documents: Array<any> = [];

    @ViewChild('searchbar')
    searchbar: any;

    private baseServerUr: string = "http://localhost:63958/";

    private apis: any = {
        setWeather: 'api/weather/set'
    }

    constructor(public alertController: AlertController,
        public loadingCtrl: LoadingController,
        public platform: Platform,
        public navCtrl: NavController,
        public http: Http,
        public weather: WeatherProvider,
        public mongoApi: MongolabDataApi,
        public completeService: CompleteService) {

        this.refreshAreas();
    }

    private handleError(res: Response | any) {
        console.error('Entering handleError');
        console.dir(res);
        return Promise.reject(res.message || res);
    }

    refreshAreas() {
        this.mongoApi.loadDocs()
            .then((data: any) => {
                this.documents = [];
                this.documents = data.json();
                this.documents.forEach((doc) => {
                    doc['checked'] = false;
                });
            });
    }
    
    sendWeather() {
        let docs = this.documents.filter(item => item.checked);
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

        this.http.post(this.baseServerUr + this.apis.setWeather,
            params, {
                headers: headers
            })
            .toPromise()
            .catch(this.handleError);
    }

    setCityName(name) {
        Keyboard.close();
        this.currentLoc = {
            'name': name ? name : this.searchbar.getValue()
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
                this.showAlert(error);
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