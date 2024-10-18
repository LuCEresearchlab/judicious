use std::vec;

use wasm_bindgen_test::*;
use python_analyzer::{analyze, AnalysisResult, ParseError, PythonFunction, PythonFunctionArgument, PythonName};

#[wasm_bindgen_test]
fn test_no_parse_errors() {
    assert_eq!(
        serde_wasm_bindgen::from_value::<AnalysisResult>(analyze("pass")).unwrap().parse_errors,
        Vec::<ParseError>::new()
    );
}

#[wasm_bindgen_test]
fn test_imported_names() {
    assert_eq!(
        serde_wasm_bindgen::from_value::<AnalysisResult>(analyze("from mod import a, b\nfrom mod2 import c")).unwrap().imported_names,
        vec![
            PythonName {
                module: "mod".to_string(),
                name: "a".to_string(),
            },
            PythonName {
                module: "mod".to_string(),
                name: "b".to_string(),
            },
            PythonName {
                module: "mod2".to_string(),
                name: "c".to_string(),
            },
        ]
    );
}

#[wasm_bindgen_test]
fn test_defined_functions() {
    assert_eq!(
        serde_wasm_bindgen::from_value::<AnalysisResult>(analyze("def f(a: int)->list[int]:\n    \"\"\"Doc\"\"\"\n    pass\ndef g(a, b = 1, *c): pass")).unwrap().defined_functions,
        vec![
            PythonFunction {
                name: "f".to_string(),
                args: vec![
                    PythonFunctionArgument {
                        name: "a".to_string(),
                        type_str: "int".to_string(),
                        default: None,
                        variable_length: false,
                    },
                ],
                return_type_str: "list[int]".to_string(),
                docstring: "Doc".to_string(),
            },
            PythonFunction {
                name: "g".to_string(),
                args: vec![
                    PythonFunctionArgument {
                        name: "a".to_string(),
                        type_str: "".to_string(),
                        default: None,
                        variable_length: false,
                    },
                    PythonFunctionArgument {
                        name: "b".to_string(),
                        type_str: "".to_string(),
                        default: Some("1".to_string()),
                        variable_length: false,
                    },
                    PythonFunctionArgument {
                        name: "c".to_string(),
                        type_str: "".to_string(),
                        default: None,
                        variable_length: true,
                    },
                ],
                return_type_str: "".to_string(),
                docstring: "".to_string(),
            },
        ]
    );
}

#[wasm_bindgen_test]
fn test_ellipsis() {
    assert_eq!(
        serde_wasm_bindgen::from_value::<AnalysisResult>(analyze("1 + ...")).unwrap().has_ellipsis,
        true
    );
}

#[wasm_bindgen_test]
fn test_called_names() {
    assert_eq!(
        serde_wasm_bindgen::from_value::<AnalysisResult>(analyze("f(g())")).unwrap().called_names,
        vec!["f".to_string(), "g".to_string()],
    );
}

#[wasm_bindgen_test]
fn test_imported_names_with_parse_errors() {
    let result = serde_wasm_bindgen::from_value::<AnalysisResult>(analyze("from mod import a, b,\n\n1+")).unwrap();
    assert_eq!(
        result.imported_names,
        vec![
            PythonName {
                module: "mod".to_string(),
                name: "a".to_string(),
            },
            PythonName {
                module: "mod".to_string(),
                name: "b".to_string(),
            },
        ]
    );
    assert_eq!(
        result.parse_errors,
        vec![
            ParseError {
                message: "Trailing comma not allowed".to_string(),
                location: (20, 21),
            },
            ParseError {
                message: "Expected an expression".to_string(),
                location: (25, 25),
            },
        ]
    );
}

#[wasm_bindgen_test]
fn test_import_ranges() {
    let result = serde_wasm_bindgen::from_value::<AnalysisResult>(analyze("from mod import a, b\nfrom mod2 import c")).unwrap();
    assert_eq!(
        result.import_ranges,
        vec![
            (0, 20),
            (21, 39),
        ]
    );
}