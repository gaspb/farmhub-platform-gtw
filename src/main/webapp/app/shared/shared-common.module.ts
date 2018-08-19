import { NgModule } from '@angular/core';

import { GtwSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent } from './';

@NgModule({
    imports: [GtwSharedLibsModule],
    declarations: [JhiAlertComponent, JhiAlertErrorComponent],
    exports: [GtwSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent]
})
export class GtwSharedCommonModule {}
