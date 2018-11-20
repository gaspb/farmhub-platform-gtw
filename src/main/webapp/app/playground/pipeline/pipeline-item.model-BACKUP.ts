import { isUndefined } from 'util';
export class PipelineItemVM {
    private _data: any;
    private _lazyData: any;
    private _itemType: String;
    private _isFormValid: boolean;
    private _formContent: any;
    private _modelHtml: any;
    private _statsLink;

    constructor(itemType: String, lazyData?: any) {
        this._itemType = itemType;
        if (!isUndefined(lazyData)) {
            this._lazyData = lazyData;
        }
    }

    get modelHtml(): any {
        return this._modelHtml;
    }

    set modelHtml(value: any) {
        this._modelHtml = value;
    }

    get data(): any {
        return this._data;
    }

    set data(value: any) {
        this._data = value;
    }

    get lazyData(): any {
        return this._lazyData;
    }

    set lazyData(value: any) {
        this._lazyData = value;
    }

    get itemType(): String {
        return this._itemType;
    }

    set itemType(value: String) {
        this._itemType = value;
    }

    get isFormValid(): boolean {
        return this._isFormValid;
    }

    set isFormValid(value: boolean) {
        this._isFormValid = value;
    }

    get formContent(): any {
        return this._formContent;
    }

    set formContent(value: any) {
        this._formContent = value;
    }

    get statsLink() {
        return this._statsLink;
    }

    set statsLink(value) {
        this._statsLink = value;
    }
}
