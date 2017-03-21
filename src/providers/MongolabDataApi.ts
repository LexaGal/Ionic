import { Http, Response } from '@angular/http';
import { Injectable } from "@angular/core";

@Injectable()
export class MongolabDataApi {

    databaseEndpoint = 'https://api.mlab.com/api/1/databases/alexmongodb/collections/plantsareas?apiKey=';
    myApiKey: string = "ZDgj_gHxqtfEDHcbwnW3aG8VEzHG_ajj";

    constructor(public http: Http) {
    }

    loadDocs(): Promise<any> {
        return  this.http.get(this.databaseEndpoint +  this.myApiKey)
            .toPromise()
            .catch(this.handleError);
    }

    private handleError(res: Response | any) {
        console.error('Entering handleError');
        console.dir(res);
        return Promise.reject(res.message || res);
    }
}