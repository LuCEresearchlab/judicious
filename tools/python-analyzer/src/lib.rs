use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;
use rustpython_parser::{Mode, parse as parser_parse};
use rustpython_parser::ast::{Visitor, Stmt, StmtImportFrom, StmtFunctionDef, Expr, ExprCall, ExprConstant, Arguments, ArgWithDefault};
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
"#;

#[derive(Serialize, Deserialize)]
struct PythonName {
    module: String,
    name: String,
}

struct ImportedNamesCollector {
    names: Vec<PythonName>,
}
impl Visitor for ImportedNamesCollector {
    fn visit_stmt_import_from(&mut self, node: StmtImportFrom) {
        if let Some(module) = node.module {
            for alias in &node.names {
                self.names.push(PythonName { module: module.to_string(), name: alias.name.to_string() });
            }
        }
    }
}

#[derive(Serialize, Deserialize)]
struct PythonFunction {
    name: String,
    args: Vec<PythonFunctionArgument>,
    return_type_str: String,
    docstring: String,
}

#[derive(Serialize, Deserialize)]
struct PythonFunctionArgument {
    name: String,
    type_str: String,
    default: Option<String>,
    variable_length: bool,
}

fn get_type_str(optional_expr: &Option<Box<Expr>>) -> String {
    optional_expr.as_ref().map_or_else(|| String::new(), |expr| expr.to_string())
}

fn argument_with_default(arg: &ArgWithDefault) -> PythonFunctionArgument {
    PythonFunctionArgument {
        name: arg.def.arg.to_string(),
        type_str: get_type_str(&arg.def.annotation),
        default: arg.default.as_ref().map(|expr| expr.to_string()),
        variable_length: false,
    }
}

fn arguments(ast_args: &Arguments) -> Vec<PythonFunctionArgument> {
    let args = ast_args.args.iter().map(argument_with_default);
    let vararg = ast_args.vararg.as_ref().map(|arg| PythonFunctionArgument {
        name: arg.arg.to_string(),
        type_str: get_type_str(&arg.annotation),
        default: None,
        variable_length: true,
    });
    let kwonlyargs = ast_args.kwonlyargs.iter().map(argument_with_default);
    return args.chain(vararg).chain(kwonlyargs).collect(); 
}

struct FunctionDefinitionsCollector {
    functions: Vec<PythonFunction>,
}
impl Visitor for FunctionDefinitionsCollector {
    fn visit_stmt_function_def(&mut self, node: StmtFunctionDef) {
        self.functions.push(PythonFunction {
            name: node.name.to_string(),
            args: arguments(&node.args),
            return_type_str: get_type_str(&node.returns),
            docstring: node.body.first().and_then(|stmt| {
                if let Stmt::Expr(expr) = stmt {
                    if let Expr::Constant(constant) = expr.value.as_ref() {
                        return constant.value.as_str().map(|s| s.to_string());
                    }
                }
                return None;
            }).unwrap_or(String::new()),
        });
    }
}

struct CalledNamesCollector {
    names: Vec<String>,
}
impl Visitor for CalledNamesCollector {
    fn visit_expr_call(&mut self, node: ExprCall) {
        if let Expr::Name(name) = &*node.func {
            self.names.push(name.id.to_string());
        }
        self.generic_visit_expr_call(node);
    }
}

struct EllipsisFinder {
    found: bool,
}
impl Visitor for EllipsisFinder {
    fn visit_expr_constant(&mut self, node: ExprConstant) {
        if node.value.is_ellipsis() {
            self.found = true;
        }
    }
}

pub fn parse_to_stmts(python_source: &str) -> Result<Vec<Stmt>, String> {
    match parser_parse(python_source, Mode::Module, "cell") {
        Ok(m) => {
            return Ok(m.expect_module().body)
        },
        Err(e) => {
            return Err(format!("{}", e));
        }
    }
}

fn parse_and_process_stmts<F, T>(python_source: &str, process: F) -> Result<JsValue, JsValue>
where F: Fn(Vec<Stmt>) -> T, T: Serialize {
    match parse_to_stmts(python_source) {
        Ok(stmts) => {
            return Ok(serde_wasm_bindgen::to_value(&process(stmts))?);
        },
        Err(e) => {
            return Err(JsValue::from_str(e.as_str()));
        }
    }
}

#[wasm_bindgen]
pub fn parse(python_source: &str) -> Result<JsValue, JsValue> {
    parse_and_process_stmts(python_source, |_| true)
}
 
#[wasm_bindgen]
pub fn imported_names(python_source: &str) -> Result<JsValue, JsValue> {
    parse_and_process_stmts(python_source, |stmts| {
        let mut collector = ImportedNamesCollector { names: Vec::new() };
        for stmt in stmts {
            collector.visit_stmt(stmt);
        }
        collector.names
    })
}

#[wasm_bindgen]
pub fn defined_functions(python_source: &str) -> Result<JsValue, JsValue> {
    parse_and_process_stmts(python_source, |stmts| {
        let mut collector = FunctionDefinitionsCollector { functions: Vec::new() };
        for stmt in stmts {
            collector.visit_stmt(stmt);
        }
        collector.functions
    })
}

#[wasm_bindgen]
pub fn called_names(python_source: &str) -> Result<JsValue, JsValue> {
    parse_and_process_stmts(python_source, |stmts| {
        let mut collector = CalledNamesCollector { names: Vec::new() };
        for stmt in stmts {
            collector.visit_stmt(stmt);
        }
        collector.names
    })
}

#[wasm_bindgen]
pub fn find_ellipsis(python_source: &str) -> Result<JsValue, JsValue> {
    parse_and_process_stmts(python_source, |stmts| {
        let mut finder = EllipsisFinder {
            found: false,
        };
        for stmt in stmts {
            finder.visit_stmt(stmt);
        }
        finder.found
    })
}
