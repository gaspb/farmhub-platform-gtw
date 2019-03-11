export class CurrentComponentDTO {
    constructor(
        public savedOperations: any[],
        public savedPipelines: any[],
        public templateComponents: any[],
        public operationComponents: any[],
        public pipelineComponents: any[]
    ) {}

    getBase64(): string {
        //TODO
        return btoa(JSON.stringify(this, null, 4));
    }
    static fromBase64(binary: string): CurrentComponentDTO {
        return JSON.parse(atob(binary)); //todo use custom parser
    }

    static build() {
        return new CurrentComponentDTO([], [], [], [], []);
    }
}

/*
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/dashboard.component.backup.ts(39,52):
 TS2551: Property 'activeDashboardProject' does not exist on type 'DashboardService'. Did you mean 'saveDashboardProject'?
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/dashboard.component.ts(69,27):
 TS2554: Expected 8 arguments, but got 3.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/dashboard.component.ts(80,30):
 TS2554: Expected 11 arguments, but got 2.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/project.model.ts(3,5):
 TS2392: Multiple constructor implementations are not allowed.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/project.model.ts(18,5):
 TS2392: Multiple constructor implementations are not allowed.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/project.model.ts(19,16):
 TS2300: Duplicate identifier 'name'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/project.model.ts(24,9):
 TS2322: Type 'undefined[]' is not assignable to type 'any[]'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/project.model.ts(25,9):
 TS2322: Type 'undefined[]' is not assignable to type 'any[]'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/project.model.ts(26,9):
 TS2322: Type 'undefined[]' is not assignable to type 'any[]'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/project.model.ts(27,9):
 TS2322: Type 'undefined[]' is not assignable to type 'any[]'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/project.model.ts(28,9):
 TS2322: Type 'undefined[]' is not assignable to type 'any[]'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/project.model.ts(29,9):
 TS2322: Type 'undefined[]' is not assignable to type 'any[]'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/project.model.ts(37,32):
 TS2345: Argument of type 'String' is not assignable to parameter of type 'string'.
 'string' is a primitive, but 'String' is a wrapper object. Prefer using 'string' when possible.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/team.model.ts(2,5):
 TS2392: Multiple constructor implementations are not allowed.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/team.model.ts(19,5):
 TS2392: Multiple constructor implementations are not allowed.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/team.model.ts(20,16):
 TS2300: Duplicate identifier 'name'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/team.model.ts(22,16):
 TS2300: Duplicate identifier 'project'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/team.model.ts(27,9):
 TS2322: Type 'undefined[]' is not assignable to type 'any[]'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/team.model.ts(28,9):
 TS2322: Type 'undefined[]' is not assignable to type 'any[]'.
 ERROR in C:/dev/PROJECTS/HighJack_CDCI/gtw/src/main/webapp/app/dashboard/team.model.ts(29,9):


 */
