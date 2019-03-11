import { MSDTO } from './msdto.model';
export class ApiDoc {
    //parent, set when instanciating the MSDTO
    msDTO: MSDTO;

    inputJSONMinimalType: any;

    constructor(
        public path: string,
        public name: string,
        public reqType: string,
        public serviceId: string,
        public serviceInstances: any[],
        public requestHeader: Object,
        public responseHeader: string,
        public inputDataType: string[],
        public parameters: any[],
        public inputJSONType: any,
        public outputDataType: string,
        public responseJSONResponseType: any,
        public responseType: string
    ) {
        this.inputJSONType = inputJSONType;
        this.buildInputJSONMinimalType();
    }

    private buildInputJSONMinimalType() {
        this.inputJSONMinimalType = JSON.stringify(this.buildInputJSONMinimalType_iterate(JSON.parse(this.inputJSONType)), null, 4);
    }
    private buildInputJSONMinimalType_iterate(obj) {
        const type = obj.type
            ? obj.type.toLowerCase()
            : obj.constructor.name == 'Array' ? 'ext-array' : obj.constructor.name == 'Object' ? 'ext-object' : 'default';
        let ret = {};
        switch (type) {
            case 'string':
            case 'integer':
                return type;
            case 'array':
                obj = [this.buildInputJSONMinimalType_iterate(obj.items)];
                return obj;
            case 'object':
                if (obj.properties) {
                    Object.keys(obj.properties).forEach(key => (ret[key] = this.buildInputJSONMinimalType_iterate(obj[key])));
                }
                return ret;
            case 'ext-object':
                Object.keys(obj).forEach(key => (ret[key] = this.buildInputJSONMinimalType_iterate(obj[key])));
                return ret;
            case 'ext-array':
                obj = obj.map(it => this.buildInputJSONMinimalType_iterate(it));
                return obj;
            default:
                return type;
        }
    }
}
