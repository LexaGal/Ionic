import { AutoCompleteService } from 'ionic2-auto-complete';
import { Http, Response } from '@angular/http';
import { Injectable } from "@angular/core";

@Injectable()
export class CompleteService implements AutoCompleteService {

    labelAttribute = "name";
    cities: Array<any> = [];

    constructor(public http: Http) {
        this.http.get("https://jsonblob.com/api/jsonBlob/d8631f89-239a-11e7-a0ba-afc15d8c6b02")
            //("http://data.okfn.org/data/core/world-cities/r/world-cities.json")
            .toPromise()
            .then((data: any) => {
                this.cities = [];
                this.cities = data.json();
                //alert(this.cities.length);
            })
            .catch(this.handleError);
    }

    private handleError(res: Response | any) {
        console.error('Entering handleError');
        console.dir(res);
        //alert(res);
        return Promise.reject(res.message || res);
    }

    getResults(keyword: string) {
            
        //setTimeout(() => {
                let a = this.cities.filter(item => item.name
                        .toLowerCase()
                        .startsWith(keyword.toLowerCase()))
                    .map(item => ({ name: (item.name + ", " + item.country) }));
                //.debounceTime(100);
                //alert(a.length);
                return a;
            //},2000);
    }
}