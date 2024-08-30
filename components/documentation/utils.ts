import { PythonFunction } from '../../src/python-analyzer/python_analyzer';
import { JudiciousDocFunction, JudiciousDocParameter } from '../../src/schemas/documentation';

export const HOVER_COLOR = '#c2ecff';
export const DARK_HOVER_COLOR = '#0eb4ff';

export function hoverProps(
  id: string,
  hover: string,
  setHover: (id: string) => void,
  dark: boolean = false,
) {
  const color = dark ? DARK_HOVER_COLOR : HOVER_COLOR;
  return {
    onMouseEnter: () => setHover(id),
    onMouseLeave: () => setHover(''),
    style: { backgroundColor: hover === id ? color : 'transparent' },
  };
}

export function paramId(i: number) {
  return `param-${i}`;
}

export function nameId() {
  return 'name';
}

export function returnId() {
  return 'return';
}

export function moduleId() {
  return 'module';
}

export function iconPath(module: string) {
  if (module === '.') {
    return '/codeblock-icon.svg';
  }
  return '/python-logo.svg';
}

export function sentence(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function visibleParameters(params: JudiciousDocParameter[], showOptional: boolean) {
  return params.filter((param) => param.default === undefined || showOptional);
}

export function definedFnToJudiciousDocFunction(fn: PythonFunction): JudiciousDocFunction {
  return {
    kind: 'function',
    name: fn.name,
    description: {
      p: [fn.docstring],
    },
    parameters: fn.args.map((arg) => ({
      name: arg.name,
      type: arg.type_str,
      description: '',
      default: arg.default,
      variableLength: arg.variable_length,
    })),
    ...(fn.return_type_str !== '') && {
      returnValue: {
        type: fn.return_type_str,
        description: '',
      },
    },
  };
}
