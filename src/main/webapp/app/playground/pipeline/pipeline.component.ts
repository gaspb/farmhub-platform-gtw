import { Component, OnInit } from '@angular/core';
import { PlaygroundService } from '../playground.service';
import { PipelineVM } from './pipeline.model';
import { PipelineItemVM } from './pipeline-item.model';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'pipeline-view',
    templateUrl: './pipeline.component.html'
})
export class PipelineComponent implements OnInit {
    pipelines: PipelineVM[];
    activePipelineItemDiv;
    activePipelineItem: PipelineItemVM;
    activePipeline: PipelineVM;
    formActive = false;
    formType: string;
    formCallback;

    constructor(private pgService: PlaygroundService) {}
    s;
    ngOnInit() {
        this.pipelines = [];
    }
    log(...any) {
        console.log('PIPELINE_LOGGER', any);
    }
    addPipeline() {
        this.openForm('endpoint', function(formResultItem) {
            let pl = new PipelineVM('Pipeline01');
            pl.props.endpoint.type = formResultItem.type;
            pl.props.endpoint.item = formResultItem.data;
            this.validateEndpoint(pl);
            this.pipelines.push(pl);
        });
    }

    openForm(formType: string, callback) {
        if ((this.activePipeline && this.activePipelineItem) || formType == 'endpoint') {
            this.formActive = true;
            this.formType = formType;
            this.formCallback = callback;
        }
    }
    completeForm(formItem) {
        this.formActive = false;
        this.formCallback(JSON.parse(JSON.stringify(formItem)));
    }

    validateEndpoint(pipeline: PipelineVM) {
        console.log('VALIDATING', pipeline.props.endpoint.item['operationName']);
        pipeline.props.isValidEndpoint = true;
        let endpoint = new PipelineItemVM('endpoint');
        endpoint.lazyData = {
            name: pipeline.props.endpoint.item['operationName']
        };
        if (!pipeline.items || pipeline.items.length == 0) {
            pipeline.items = [endpoint];
        } else {
            pipeline.items[0] = endpoint;
        }
    }

    handlePipelineItemClick(pipeline, item, div) {
        this.activePipeline = pipeline;
        this.activePipelineItem = item;
        this.setActivePipelineItemDiv(div);
    }

    setActivePipelineItemDiv(div) {
        console.log('setting div active : ', div);
        const divIsActive: boolean = div.classList.contains('pl-item-active');
        if (this.activePipelineItemDiv != null) {
            this.activePipelineItemDiv.classList.remove('pl-item-active');
        }
        if (divIsActive) {
            div.classList.remove('pl-item-active');
            this.activePipelineItemDiv = null;
        } else {
            div.classList.add('pl-item-active');
            this.activePipelineItemDiv = div;
        }
    }

    resetActiveDiv() {
        this.setActivePipelineItemDiv(this.activePipelineItemDiv);
    }

    insertPipelineItem(item: PipelineItemVM) {
        if (
            isNullOrUndefined(this.activePipeline) ||
            isNullOrUndefined(this.activePipelineItem) ||
            isNullOrUndefined(this.activePipelineItemDiv)
        ) {
            this.log('Aborted insert : no active pipeline element');
            return false;
        }
        const offset = this.activePipelineItemDiv.classList.contains('before') ? 0 : 1;
        this.activePipeline.items.splice(this.activePipeline.items.indexOf(this.activePipelineItem) + offset, 0, item);
        this.resetActiveDiv();
    }

    addDataTransformation() {
        this.openForm('data-transformation', function(formResultItem) {
            let transfo = new PipelineItemVM('data-transformation');
            transfo.lazyData = formResultItem;
            this.insertPipelineItem(transfo);
        });
    }

    addModelTraining() {
        let transfo = new PipelineItemVM('model-training');
        transfo.lazyData = {
            name: 'Training'
        };
        this.insertPipelineItem(transfo);
    }

    addDatabaseTransaction() {
        let transfo = new PipelineItemVM('database-transaction');
        transfo.lazyData = {
            name: 'DbTransaction'
        };
        this.insertPipelineItem(transfo);
    }

    addOutput() {
        let transfo = new PipelineItemVM('output');
        transfo.lazyData = {
            name: 'Output01'
        };
        this.insertPipelineItem(transfo);
    }

    saveAndRunPipeline(pipeline: PipelineVM) {
        pipeline.status = 'running';
    }

    stopPipeline(pipeline: PipelineVM) {
        pipeline.status = 'stopped';
    }

    deletePipeline(pipeline: PipelineVM) {
        this.pipelines = this.pipelines.filter(ppl => ppl != pipeline);
    }
}
