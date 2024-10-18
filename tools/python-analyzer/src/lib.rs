use ruff_python_ast::statement_visitor::StatementVisitor;
use ruff_python_ast::visitor;
use ruff_python_ast::Expr;
use ruff_python_ast::ParameterWithDefault;
use ruff_python_ast::Parameters;
use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;
use ruff_python_ast::Stmt;
use ruff_python_ast::visitor::Visitor;
use ruff_python_parser::{Mode, parse_unchecked};
use ruff_text_size::Ranged;

use serde::{Deserialize, Serialize};
pub fn start() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen(typescript_custom_section)]
const TYPES: &'static str = r#"
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
"#;

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct PythonName {
    pub module: String,
    pub name: String,
}

struct ImportedNamesCollector {
    names: Vec<PythonName>,
}
impl StatementVisitor<'_> for ImportedNamesCollector {
    fn visit_stmt(&mut self, node: &Stmt) {
        if let Stmt::ImportFrom(importnode) = node {
            if let Some(module) = &importnode.module {
                for alias in &importnode.names {
                    self.names.push(PythonName { module: module.to_string(), name: alias.name.to_string() });
                }
            }
        }
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct ImportRangesVisitor {
    pub ranges: Vec<(u32, u32)>,
}

impl StatementVisitor<'_> for ImportRangesVisitor {
    fn visit_stmt(&mut self, node: &Stmt) {
        if let Stmt::ImportFrom(importnode) = node {
            self.ranges.push((importnode.range().start().to_u32(), importnode.range().end().to_u32()));
        }
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct PythonFunction {
    pub name: String,
    pub args: Vec<PythonFunctionArgument>,
    pub return_type_str: String,
    pub docstring: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct PythonFunctionArgument {
    pub name: String,
    pub type_str: String,
    pub default: Option<String>,
    pub variable_length: bool,
}

fn get_type_str(optional_expr: &Option<Box<Expr>>, source: &str) -> String {
    optional_expr.as_ref().map_or_else(String::new, |expr| source[expr.range()].to_string())
}

fn parameter_with_default(param: &ParameterWithDefault, source: &str) -> PythonFunctionArgument {
    PythonFunctionArgument {
        name: param.parameter.name.to_string(),
        type_str: get_type_str(&param.parameter.annotation, source),
        default: param.default.as_ref().map(|expr| source[expr.range()].to_string()),
        variable_length: false,
    }
}

fn parameters(ast_params: &Parameters, source: &str) -> Vec<PythonFunctionArgument> {
    let args = ast_params.args.iter().map(|arg| parameter_with_default(arg, source));
    let vararg = ast_params.vararg.as_ref().map(|arg| PythonFunctionArgument {
        name: arg.name.to_string(),
        type_str: get_type_str(&arg.annotation, source),
        default: None,
        variable_length: true,
    });
    let kwonlyargs = ast_params.kwonlyargs.iter().map(|arg| parameter_with_default(arg, source));
    args.chain(vararg).chain(kwonlyargs).collect()
}

struct FunctionDefinitionsCollector {
    functions: Vec<PythonFunction>,
    source: String,
}
impl StatementVisitor<'_> for FunctionDefinitionsCollector {
    fn visit_stmt(&mut self, node: &Stmt) {
        if let Stmt::FunctionDef(fndefnode) = node {
            self.functions.push(PythonFunction {
                name: fndefnode.name.to_string(),
                args: parameters(&fndefnode.parameters, &self.source),
                return_type_str: get_type_str(&fndefnode.returns, &self.source),
                docstring: fndefnode.body.first().and_then(|stmt| {
                    if let Stmt::Expr(expr) = stmt {
                        if let Expr::StringLiteral(strliteralnode) = expr.value.as_ref() {
                            return Some(strliteralnode.value.to_str().to_string());
                        }
                    }
                    None
                }).unwrap_or(String::new()),
            });
        }
    }
}

struct CalledNamesCollector {
    names: Vec<String>,
}
impl Visitor<'_> for CalledNamesCollector {
    fn visit_expr(&mut self, node: &Expr) {
        if let Expr::Call(callnode) = node {
            if let Expr::Name(name) = &*callnode.func {
                self.names.push(name.id.to_string());
            }
            visitor::walk_expr(self, node);
        }
    }
}

struct EllipsisFinder {
    found: bool,
}
impl Visitor<'_> for EllipsisFinder {
    fn visit_expr(&mut self, node: &Expr) {
        if node.is_ellipsis_literal_expr() {
            self.found = true;
        }
        visitor::walk_expr(self, node);
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct ParseError {
    pub message: String,
    pub location: (u32, u32),
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct AnalysisResult {
    pub imported_names: Vec<PythonName>,
    pub defined_functions: Vec<PythonFunction>,
    pub called_names: Vec<String>,
    pub has_ellipsis: bool,
    pub import_ranges: Vec<(u32, u32)>,
    pub parse_errors: Vec<ParseError>,
}

#[wasm_bindgen]
pub fn analyze(python_source: &str) -> JsValue {
    let parsed = parse_unchecked(python_source, Mode::Module);
    let parse_errors = parsed.errors().iter().map(|e| ParseError {
        message: e.error.to_string(),
        location: (e.location.start().to_u32(), e.location.end().to_u32()),
    }).collect();
    let stmts = parsed.into_syntax().expect_module().body;
    let imported_names = {
        let mut collector = ImportedNamesCollector { names: Vec::new() };
        collector.visit_body(&stmts);
        collector.names
    };
    let defined_functions = {
        let mut collector = FunctionDefinitionsCollector { functions: Vec::new(), source: python_source.to_string() };
        collector.visit_body(&stmts); 
        collector.functions
    };
    let called_names = {
        let mut collector = CalledNamesCollector { names: Vec::new() };
        collector.visit_body(&stmts);
        collector.names
    };
    let has_ellipsis = {
        let mut finder = EllipsisFinder {
            found: false,
        };
        finder.visit_body(&stmts);
        finder.found
    };
    let import_ranges = {
        let mut visitor = ImportRangesVisitor { ranges: Vec::new() };
        visitor.visit_body(&stmts);
        visitor.ranges
    };
    let result = AnalysisResult {
        imported_names,
        defined_functions,
        called_names,
        has_ellipsis,
        import_ranges,
        parse_errors,
    };
    serde_wasm_bindgen::to_value(&result).unwrap()
}
 