/* tslint:disable */
/* eslint-disable */
/**
* @param {string} python_source
* @returns {any}
*/
export function analyze(python_source: string): any;

export interface PythonName {
    module: string;
    name: string;
};
export interface PythonFunction {
    name: string;
    args: PythonFunctionArgument[];
    return_type_str: string;
    docstring: string;
};
export interface PythonFunctionArgument {
    name: string;
    type_str: string;
    default: string | undefined;
    variable_length: boolean;
};
export interface ParseError {
    message: string;
    location: [number, number];
};
export interface AnalysisResult {
    imported_names: PythonName[];
    defined_functions: PythonFunction[];
    called_names: string[];
    has_ellipsis: boolean;
    import_ranges: [number, number][];
    parse_errors: ParseError[];
};


