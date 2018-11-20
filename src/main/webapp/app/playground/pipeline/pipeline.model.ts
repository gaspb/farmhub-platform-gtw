export class Options {}

export class EndpointWithTrigger {
    endpoint: Endpoint;
    trigger: Trigger;

    constructor() {}
}

export class Endpoint {
    name: string;
    endpointType: string;
    address: string;
    port: number;
    kafkaInputKey: string;
    options: any;
    constructor() {}
}

export class Trigger {
    name: string;
    outputEndpointURL: string;
    ttype: string;
}

export class Opt {
    excludeCommonWords: string;
    top: string;
    type: string;
    outputEndpointURL: string;
    collectionLevel: string;
    from: string;
    to: string;
}

export class Element {
    elementType: string;
    id: string;
    name: string;
    ttype: string;
    opt: Opt;
    outputEndpointURL: string;
    otype: string;
    position: number;

    constructor() {
        this.id = 'elem-' + Math.random();
        this.opt = new Opt();
    }
}

export class Branch {
    elements: Element[];
    branchId: number;
    parentBranchId: number;
    position: number;

    constructor() {
        this.elements = [];
    }
}

export class PipelineVM {
    status: string;
    pipelineId: string;
    endpoint: Endpoint;
    trigger: Trigger;
    branches: Branch[];

    constructor() {}
}
