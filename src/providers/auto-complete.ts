import { AutoCompleteService } from 'ionic2-auto-complete';
import { Http, Response } from '@angular/http';
import { Injectable } from "@angular/core";

@Injectable()
export class CompleteTestService implements AutoCompleteService {

    labelAttribute = "name";
    cities: Array<any> = [];

    constructor(public http: Http) {
        this.http.get("/assets/city.list.json")
            .toPromise()
            .then((data: any) => {
                this.cities = [];
                this.cities = data.json(); //.slice(0, 1000);
            })
            .catch(this.handleError);
    }

    private handleError(res: Response | any) {
        console.error('Entering handleError');
        console.dir(res);
        return Promise.reject(res.message || res);
    }

    getResults(keyword: string) {
        return this.cities.filter(item => item.name
            .toLowerCase()
            .startsWith(keyword.toLowerCase()))
        .map(item => ({ name: (item.name + ", " + item.country) }));

        //this.http.get("https://restcountries.eu/rest/v1/name/"+keyword)
        //.map(
        //  result => {
        //      return result.json()
        //          .filter(item => item.name.toLowerCase().startsWith(keyword.toLowerCase()));
        //  });
    }
}