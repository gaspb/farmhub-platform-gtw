import { DriverDTO } from './driver.model';
export class SensorDTO {
    metadata: any;
    name: string;
    driver: DriverDTO;

    constructor() {}
}
