import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class WeatherProvider {
    private weatherEndpoint = 'http://api.openweathermap.org/data/2.5/';
    private weatherKey = 'bae4603c7cce559217030e726ccb15cb';

    constructor(public http: Http) {
        console.log('Hello Weather Provider');
    }

    getCurrent(loc: any): Promise<any> {
        let url: string = this.makeDataUrl(loc, 'weather');
        return this.http.get(url)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    private makeDataUrl(loc: any, command: string): string {
        let uri = this.weatherEndpoint + command;

        if (loc.long) {
            uri += '?lat=' + loc.lat + '&lon=' + loc.long;
        } else if (loc.id) {
            uri += '?id=' + loc.id;
        } else if (loc.name) {
            uri += '?q=' + loc.name;
        }

        uri += '&units=metric';

        uri += '&APPID=' + this.weatherKey;

        return uri;
    }
    
    private extractData(res: Response) {
        let body = res.json();
        return body || {};
    }
    
    private handleError(res: Response | any) {
        console.error('Entering handleError');
        console.dir(res);
        return Promise.reject(res.message || res);
    }
}
