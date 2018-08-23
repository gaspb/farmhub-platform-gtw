import { LOCALE_ID, NgModule } from '@angular/core';
import { JhiAlertErrorComponent } from './alert/alert-error.component';
import { JhiAlertComponent } from './alert/alert.component';
import { GtwSharedLibsModule } from './shared-libs.module';
import { Title } from '@angular/platform-browser';
import { WindowRef } from '../core/tracker/window.service';

@NgModule({
    imports: [GtwSharedLibsModule],
    declarations: [JhiAlertComponent, JhiAlertErrorComponent],
    providers: [
        WindowRef,
        Title,
        {
            provide: LOCALE_ID,
            useValue: 'en'
        }
    ],
    exports: [GtwSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent]
})
export class GtwSharedCommonModule {
    constructor() {}
}
