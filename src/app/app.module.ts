import { Weather } from '../providers/weather';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { CompleteTestService } from '../providers/auto-complete';
import { AUTOCOMPLETE_DIRECTIVES, AUTOCOMPLETE_PIPES } from 'ionic2-auto-complete';

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
    providers: [Weather, CompleteTestService, { provide: ErrorHandler, useClass: IonicErrorHandler }]
})
export class AppModule { }
