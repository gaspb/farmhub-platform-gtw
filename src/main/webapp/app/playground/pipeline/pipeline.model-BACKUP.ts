import { PipelineItemVM } from './pipeline-item.model';
export class PipelineVM {
    private _pipelineName: String;
    private _options = {
        defaultLineWidth: '35px',
        defaultMinimalLineWidth: '15px',
        defaultLineHeight: '10px',
        defaultItemSizeRatio: 2,
        defaultItemOffset: 0
    };
    private _props = {
        isValidEndpoint: false,
        endpoint: {
            type: undefined,
            item: {}
        }
    };
    private _items: PipelineItemVM[];
    private _status: String;

    constructor(pipelineName: String) {
        this._pipelineName = pipelineName;
    }

    get pipelineName(): String {
        return this._pipelineName;
    }

    set pipelineName(value: String) {
        this._pipelineName = value;
    }

    get options(): {
        defaultLineWidth: string;
        defaultMinimalLineWidth: string;
        defaultLineHeight: string;
        defaultItemSizeRatio: number;
        defaultItemOffset: number;
    } {
        return this._options;
    }

    set options(value: {
        defaultLineWidth: string;
        defaultMinimalLineWidth: string;
        defaultLineHeight: string;
        defaultItemSizeRatio: number;
        defaultItemOffset: number;
    }) {
        this._options = value;
    }

    get props(): { isValidEndpoint: boolean; endpoint: { type: any; item: {} } } {
        return this._props;
    }

    set props(value: { isValidEndpoint: boolean; endpoint: { type: any; item: {} } }) {
        this._props = value;
    }

    get items(): PipelineItemVM[] {
        return this._items;
    }

    set items(value: PipelineItemVM[]) {
        this._items = value;
    }

    get status(): String {
        return this._status;
    }

    set status(value: String) {
        this._status = value;
    }
}
