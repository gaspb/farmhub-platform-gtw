import { ApiDoc } from './apidoc.model';
export class MSDTO {
    constructor(
        public path: string,
        public serviceId: string,
        public serviceInstances: any[],
        public gtwayProperties: string,
        public definitions: any,
        public apiDoc: ApiDoc[]
    ) {
        this.apiDoc = apiDoc;
        this.associateChildren();
    }

    associateChildren() {
        this.apiDoc.forEach(
            api => (api.msDTO = new MSDTO(this.path, this.serviceId, this.serviceInstances, this.gtwayProperties, this.definitions, []))
        );
    }
}
