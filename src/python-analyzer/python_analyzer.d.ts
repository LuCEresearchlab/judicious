/* tslint:disable */
/* eslint-disable */
/**
* @param {string} python_source
* @returns {any}
*/
export function parse(python_source: string): any;
/**
* @param {string} python_source
* @returns {any}
*/
export function imported_names(python_source: string): any;
/**
* @param {string} python_source
* @returns {any}
*/
export function defined_functions(python_source: string): any;
/**
* @param {string} python_source
* @returns {any}
*/
export function called_names(python_source: string): any;
/**
* @param {string} python_source
* @returns {any}
*/
export function find_ellipsis(python_source: string): any;

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


