export class TeamRequestDTO {
    handledBy;

    constructor(
        public id: string,
        public fromUser: string,
        public toGroup: string,
        public view: string,
        public priority: number,
        public name: string,
        public dod: string,
        public time: string
    ) {}

    static build(fromUser: string, toGroup: string, view: string, priority: number, name: string, dod: string): TeamRequestDTO {
        let id =
            (fromUser + '_' + toGroup)
                .toLowerCase()
                .trim()
                .replace(/\s/g, '') + Date.now();

        return new TeamRequestDTO(id, fromUser, toGroup, view, priority, name, dod, new Date().toUTCString());
    }
    getBase64(): string {
        //TODO
        return btoa(JSON.stringify(this, null, 4));
    }
    static fromBase64(binary: string): TeamRequestDTO {
        return JSON.parse(atob(binary)); //todo use custom parser
    }
}
