import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
   
import { WeatherProvider } from '../providers/WeatherProvider';
import { CompleteService } from '../providers/CompleteService';
import { AUTOCOMPLETE_DIRECTIVES, AUTOCOMPLETE_PIPES } from 'ionic2-auto-complete';
import { MongolabDataApi } from '../providers/MongolabDataApi';

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        AUTOCOMPLETE_DIRECTIVES,
        AUTOCOMPLETE_PIPES
    ],
    imports: [
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage
    ],
    providers: [WeatherProvider, CompleteService, MongolabDataApi, { provide: ErrorHandler, useClass: IonicErrorHandler }]
})
export class AppModule { }
