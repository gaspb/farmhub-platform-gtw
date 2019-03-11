import { TeamDTO } from './team.model';
export class ProjectDTO {
    constructor(
        public id: string,
        public name: string,
        public admins: string[],
        public meta: any,
        public savedTemplates: any[],
        public savedOperations: any[],
        public savedPipelines: any[],
        public templateComponents: any[],
        public operationComponents: any[],
        public pipelineComponents: any[],
        public teams: TeamDTO[]
    ) {}

    getBase64(): string {
        //TODO
        return btoa(JSON.stringify(this, null, 4));
    }
    static fromBase64(binary: string): ProjectDTO {
        return JSON.parse(atob(binary)); //todo use custom parser
    }
    static build(name: string, user: string): ProjectDTO {
        let id =
            name
                .toLowerCase()
                .trim()
                .replace(/\s/g, '') + Math.random();
        return new ProjectDTO(id, name, Array(user), null, [], [], [], [], [], [], []);
    }
}
