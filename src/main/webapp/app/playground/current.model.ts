import { CurrentComponentDTO } from './current-components.model';
import { DeviceGroup } from '../dashboard/devices/device.component';
export class CurrentDTO {
    components: CurrentComponentDTO;
    deviceGroups: DeviceGroup[];

    constructor(
        public id: string,
        public projectDisplayName: string,
        public project: string,
        public team: string,
        public teamDisplayName: string,
        public projects: {
            projectId: string;
            components: CurrentComponentDTO;
        }[]
    ) {
        let proj: any[] = this.projects.filter(s => s.projectId === this.project);
        if (proj && proj.length > 0) {
            this.components = proj[0].components;
        } else {
            this.components = CurrentComponentDTO.build();
        }

        this.deviceGroups = [];
    }
    static build(userId: string): CurrentDTO {
        let id =
            ('curr_' + userId)
                .toLowerCase()
                .trim()
                .replace(/\s/g, '') + Math.random();
        return new CurrentDTO(id, '', '', '', '', []);
    }
    getBase64(): string {
        //TODO
        return btoa(JSON.stringify(this, null, 4));
    }
    static fromBase64(binary: string): CurrentDTO {
        return JSON.parse(atob(binary)); //todo use custom parser
    }
}
