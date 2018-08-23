export class HjlSwaggerParamJson {
    constructor(public paramName: string, public paramValue: any) {}

    public isJson() {
        return this.paramValue && this.paramValue.constructor.name == 'Object';
    }
    public isArray() {
        return this.paramValue && this.paramValue.constructor.name == 'Array';
    }
    public isString() {
        return this.paramValue && this.paramValue.constructor.name == 'String';
    }
    getKeys() {
        return Object.keys(this.paramValue);
    }
}
