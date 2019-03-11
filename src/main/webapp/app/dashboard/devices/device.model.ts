import { ApiDoc } from '../../playground/apidoc.model';
export class DeviceDTO {
    constructor(
        public name: string,
        public uuid: string,
        public apis: any[], //simplified ApiDoc TODO
        public exposed: boolean //true if manager is declared connected to internet (and registered to eureka?)
    ) {}
}
