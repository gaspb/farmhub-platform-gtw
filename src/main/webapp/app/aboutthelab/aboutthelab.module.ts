import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GtwSharedModule } from '../shared';

import { ABOUTTHELAB_ROUTE, AboutTheLabComponent } from './';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [GtwSharedModule, RouterModule.forRoot([ABOUTTHELAB_ROUTE], { useHash: true }), ReactiveFormsModule, FormsModule],
    declarations: [AboutTheLabComponent],
    entryComponents: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GtwAboutTheLabModule {}
