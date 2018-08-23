import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GtwSharedModule } from '../shared';

import { PLAYGROUND_ROUTE, PlaygroundComponent } from './';
import { PlaygroundService } from './playground.service';
import { DragNDropDirective } from './dragndrop.directive';
import { DragNDropComponent } from './dragndrop.component';
import { OperationComponent } from './operationview.component';
import { OpTemplateService } from './op-templates.service';
import { OpCanDeactivateGuard } from './opCanDeactivateGuard.guard';
import { OperationLogicService } from './operation-logic.service';
import { PipelineComponent } from './pipeline/pipeline.component';
import { PipelineItemFormComponent } from './pipeline/pipeline-item-form.component';

@NgModule({
    imports: [GtwSharedModule, RouterModule.forRoot([PLAYGROUND_ROUTE], { useHash: true })],
    declarations: [
        PlaygroundComponent,
        DragNDropDirective,
        DragNDropComponent,
        OperationComponent,
        PipelineComponent,
        PipelineItemFormComponent
    ],
    entryComponents: [],
    providers: [PlaygroundService, OpTemplateService, OpCanDeactivateGuard, OperationLogicService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PlaygroundModule {}
