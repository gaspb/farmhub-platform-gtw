/**
 * A driver is composed of 1 to 4 technical attributes :
 * - the code to execute + language (HAS TO COMPEL WITH A SPECIFIED INTERFACE)
 * - the dependencies of the code to execute (opt)
 * - the installation command for dependencies (opt)
 * - the uninstallation command for dependencies (opt)
 *
 */
export class DriverDTO {
    metadata;

    code: any; //file, or list of string to be placed in specified interface
    language: string;

    requiredBaseDependencies: string[]; //for information only (ex: Python3, apt-get)

    attachedDependenciesURL: string[]; //link to github zip
    attachedDependenciesFinal: FileList;

    installationCommands: string[];
    uninstallationCommands: string[];

    constructor() {}

    isCompliant() {}
}
