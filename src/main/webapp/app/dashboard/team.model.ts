import { TeamRequestDTO } from './team-request.model';
export class TeamDTO {
    constructor(
        public id: string,
        public name: string,
        public groups: [
            {
                name: string;
                users: string[];
            }
        ],
        public users: string[],
        public project: string,
        public templateComponents: any[],
        public operationComponents: any[],
        public pipelineComponents: any[],
        public teamRequests: TeamRequestDTO[]
    ) {}

    static build(name: string, user: string, project: string): TeamDTO {
        let id =
            name
                .toLowerCase()
                .trim()
                .replace(/\s/g, '') + Math.random();

        return new TeamDTO(id, name, [{ name: 'global', users: [user] }], Array(user), project, [], [], [], []);
    }
    getBase64(): string {
        //TODO
        return btoa(JSON.stringify(this, null, 4));
    }
    static fromBase64(binary: string): TeamDTO {
        return JSON.parse(atob(binary)); //todo use custom parser
    }
}
