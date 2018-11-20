import { isUndefined } from 'util';
import Element from './pipeline.model';
export class PipelineItemVM {
    private _data: Element;
    private _lazyData: any;
    private _itemType: string;

    constructor(itemType: string, lazyData?: any) {
        this._itemType = itemType;
        if (!isUndefined(lazyData)) {
            this._lazyData = lazyData;
        }
    }

    get data(): Element {
        return this._data;
    }

    set data(value: Element) {
        this._data = value;
    }

    set lazyData(value: any) {
        this._lazyData = value;
    }
    get lazyData(): any {
        return this._lazyData;
    }
    get itemType(): string {
        return this._itemType;
    }

    set itemType(value: string) {
        this._itemType = value;
    }
}
