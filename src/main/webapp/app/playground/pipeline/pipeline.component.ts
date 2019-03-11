import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PlaygroundService } from '../playground.service';
import { Branch, Element, EndpointWithTrigger, PipelineVM } from './pipeline.model';
import { isNullOrUndefined } from 'util';
import { PipelineItemVM } from './pipeline-item.model';
import { Observable } from 'rxjs/Rx';
import { downloadAsFile } from '../../shared/util/file-util';

@Component({
    selector: 'pipeline-view',
    templateUrl: './pipeline.component.html'
})
export class PipelineComponent implements OnInit {
    pipelines: PipelineVM[];
    activePipelineItemDiv;
    activePipelineItem: any;
    activePipeline: PipelineVM;
    formActive = false;
    formType: string;
    formCallback;
    pplidx = 0;

    @Output() savePipelineEmitter: EventEmitter<any> = new EventEmitter<any>();

    _options = {
        defaultLineWidth: '35px',
        defaultMinimalLineWidth: '15px',
        defaultLineHeight: '10px',
        defaultItemSizeRatio: 2,
        defaultItemOffset: 0
    };
    constructor(private pgService: PlaygroundService) {}
    s;
    ngOnInit() {
        this.pipelines = [];
    }
    log(...any) {
        console.log('PIPELINE_LOGGER', any);
    }
    downloadPipelineJSON(pipeline) {
        console.log('downloadJSON-ppl', pipeline);
        downloadAsFile(pipeline, pipeline.pipelineId + '.json', 'application/json');
    }
    addPipeline() {
        this.openForm('endpoint', function(formResultItem) {
            let pl = new PipelineVM();
            console.log('recieved endpoint form : ', formResultItem);

            let wrap: EndpointWithTrigger = formResultItem.data;
            pl.endpoint = wrap.endpoint;
            pl.endpoint.port = pl.endpoint.port ? parseInt(pl.endpoint.port.toString()) : null;
            pl.endpoint.endpointType = formResultItem.type;
            pl.endpoint.kafkaInputKey = '';
            pl.endpoint.options = {};
            pl.trigger = wrap.trigger;
            let branch = new Branch();
            branch.branchId = 0;
            branch.parentBranchId = 0;
            branch.position = 0;
            pl.branches = [branch];
            this.validateEndpoint(pl);
            pl.pipelineId = 'Pipeline 0' + ++this.pplidx;
            pl.trigger.name = 'Trigger-' + pl.pipelineId.replace(' ', '') + Math.random();
            pl.trigger.outputEndpointURL = btoa(pl.trigger.name);
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
        //TODO
        /*   console.log('VALIDATING', pipeline.props.endpoint.item['operationName']);
        pipeline.props.isValidEndpoint = true;
        let endpoint = new PipelineItemVM('endpoint');
        endpoint.lazyData = {
            name: pipeline.props.endpoint.item['operationName']
        };
        if (!pipeline.items || pipeline.items.length == 0) {
            pipeline.items = [endpoint];
        } else {
            pipeline.items[0] = endpoint;*/
        //}
    }

    handlePipelineItemClick(pipeline, item, div) {
        this.activePipeline = pipeline;
        this.activePipelineItem = item;
        this.setActivePipelineItemDiv(div);
    }
    openModal = false;
    modalContent = '';
    showDetails(item: Element, isTrigger) {
        console.log('SHOW DETAILS', item.outputEndpointURL);
        this.modalContent =
            'Details \n\n\n' +
            (item.elementType || 'TRIGGER') +
            ' : \n\n' +
            (item.otype ? item.otype : item.ttype ? item.ttype : '') +
            '\n\n\n' +
            (item.outputEndpointURL
                ? 'URL : ' +
                  (!isTrigger ? '/scalapipeline/api/test/proxy/stream_json/' : '/scalapipeline/api/test/proxy/run/') +
                  '\n' +
                  item.outputEndpointURL
                : '') +
            '\n';
        console.log('MODAL CONTENT', this.modalContent);
        this.openModal = true;
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
        this.activePipeline.branches[0].elements.splice(
            this.activePipeline.branches[0].elements.indexOf(this.activePipelineItem) + offset,
            0,
            item.data
        );
        this.resetActiveDiv();
    }

    addDataTransformation() {
        this.openForm('data-transformation', function(formResultItem) {
            console.log('Adding data transformation', formResultItem);

            let transfo = new PipelineItemVM('data-transformation');
            let el = new Element();
            el.name = formResultItem.name;
            el.elementType = 'TRANSFORMATION';
            el.opt = formResultItem.data;
            el.ttype = formResultItem.data.type;
            transfo.data = el;
            this.insertPipelineItem(transfo);
        });
    }

    addModelTraining() {
        let transfo = new PipelineItemVM('model-training');
        transfo.lazyData = {
            name: 'Training'
        };
        let el = new Element();
        el.name = 'Model training';
        el.elementType = transfo.itemType;
        transfo.data = el;
        this.insertPipelineItem(transfo);
    }

    addDatabaseTransaction() {
        let transfo = new PipelineItemVM('database-transaction');
        transfo.lazyData = {
            name: 'DbTransaction'
        };
        let el = new Element();
        el.name = 'Transaction';
        el.elementType = transfo.itemType;
        transfo.data = el;
        this.insertPipelineItem(transfo);
    }

    addOutput() {
        this.openForm('output', function(formResultItem) {
            let out = new PipelineItemVM('output');
            out.lazyData = {
                name: 'Output01'
            };
            let el = new Element();

            el.elementType = 'OUTPUT';
            el.opt = formResultItem.data;
            el.otype = formResultItem.data.type;
            el.name = el.otype;
            el.outputEndpointURL = btoa(el.opt.outputEndpointURL ? el.opt.outputEndpointURL.replace(' ', '') : el.name.replace(' ', ''));
            out.data = el;
            this.insertPipelineItem(out);
        });
    }

    savePipeline(pipeline: PipelineVM) {
        let elems = pipeline.branches[0].elements;
        let idx = 0;
        pipeline.branches[0].elements.forEach(elem => (elem.position = idx++));
        console.log('SAVING PIPELINE', pipeline);
        this.pgService.savePipeline(pipeline); //TODO

        this.savePipelineEmitter.emit();
        pipeline.status = 'saved';
    }
    deployPipeline(pipeline: PipelineVM) {
        console.log('RUNNING PIPELINE', pipeline);
        pipeline.branches[0].elements.forEach((el: Element, idx: number) => {
            el.position = idx;
        });
        this.pgService.pushPipeline(pipeline).subscribe(
            data => {
                console.log('Saved ppl ! ', data);
                return true;
            },
            error => {
                console.error('Error saving ppl !');
                return Observable.throw(error);
            }
        );
        pipeline.status = 'running';
    }

    stopPipeline(pipeline: PipelineVM) {
        pipeline.status = 'stopped';
    }

    deletePipeline(pipeline: PipelineVM) {
        this.pipelines = this.pipelines.filter(ppl => ppl != pipeline);
    }
}
