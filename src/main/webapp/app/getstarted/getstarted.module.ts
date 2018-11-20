import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GtwSharedModule } from '../shared';

import { GETSTARTED_ROUTE, GetStartedComponent } from './';

@NgModule({
    imports: [GtwSharedModule, RouterModule.forChild([GETSTARTED_ROUTE])],
    declarations: [GetStartedComponent],
    entryComponents: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GtwGetStartedModule {}
