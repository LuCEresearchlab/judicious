/* eslint-disable no-useless-escape */
/* eslint-disable prefer-regex-literals */

import { useMonaco } from '@monaco-editor/react';
import type { languages } from 'monaco-editor';

export const STRICT_PYTHON3_LANG_ID = 'strict-python3';

// Taken from https://github.com/microsoft/monaco-editor/blob/4dc7b06d9b65ba5e55620b7c1c40afdcf4f517af/src/basic-languages/python/python.ts

export function getConf(monaco: any) : languages.LanguageConfiguration {
  return {
    comments: {
      lineComment: '#',
      blockComment: ["'''", "'''"],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
      { open: "'", close: "'", notIn: ['string', 'comment'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    onEnterRules: [
      {
        beforeText: new RegExp(
          '^\\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async|match|case).*?:\\s*$',
        ),
        action: { indentAction: monaco.languages.IndentAction.Indent },
      },
    ],
    folding: {
      offSide: true,
      markers: {
        start: new RegExp('^\\s*#region\\b'),
        end: new RegExp('^\\s*#endregion\\b'),
      },
    },
  };
}

export const strictPython3Language = <languages.IMonarchLanguage>{
  defaultToken: '',
  tokenPostfix: '.python',

  keywords: [
    // This section is the result of running
    // > import keyword
    // > for k in sorted(keyword.kwlist + keyword.softkwlist): print("  '" + k + "',")
    // in a Python 3.13 REPL.

    'False',
    'None',
    'True',
    '_',
    'and',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'case',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'finally',
    'for',
    'from',
    'global',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'match',
    'nonlocal',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'try',
    'type',
    'while',
    'with',
    'yield',
  ],

  brackets: [
    { open: '{', close: '}', token: 'delimiter.curly' },
    { open: '[', close: ']', token: 'delimiter.bracket' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' },
  ],

  tokenizer: {
    root: [
      { include: '@whitespace' },
      { include: '@numbers' },
      { include: '@strings' },

      [/[,:;]/, 'delimiter'],
      [/[{}\[\]()]/, '@brackets'],

      [/@[a-zA-Z_]\w*/, 'tag'],
      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        },
      ],
    ],

    // Deal with white space, including single and multi-line comments
    whitespace: [
      [/\s+/, 'white'],
      [/(^#.*$)/, 'comment'],
      [/'''/, 'string', '@endDocString'],
      [/"""/, 'string', '@endDblDocString'],
    ],
    endDocString: [
      [/[^']+/, 'string'],
      [/\\'/, 'string'],
      [/'''/, 'string', '@popall'],
      [/'/, 'string'],
    ],
    endDblDocString: [
      [/[^"]+/, 'string'],
      [/\\"/, 'string'],
      [/"""/, 'string', '@popall'],
      [/"/, 'string'],
    ],

    // Recognize hex, negatives, decimals, imaginaries, longs, and scientific notation
    numbers: [
      [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, 'number.hex'],
      [/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, 'number'],
    ],

    // Recognize strings, including those broken across lines with \ (but not without)
    strings: [
      [/'$/, 'string.escape', '@popall'],
      [/f'{1,3}/, 'string.escape', '@fStringBody'],
      [/'/, 'string.escape', '@stringBody'],
      [/"$/, 'string.escape', '@popall'],
      [/f"{1,3}/, 'string.escape', '@fDblStringBody'],
      [/"/, 'string.escape', '@dblStringBody'],
    ],
    fStringBody: [
      [/[^\\'\{\}]+$/, 'string', '@popall'],
      [/[^\\'\{\}]+/, 'string'],
      [/\{[^\}':!=]+/, 'identifier', '@fStringDetail'],
      [/\\./, 'string'],
      [/'/, 'string.escape', '@popall'],
      [/\\$/, 'string'],
    ],
    stringBody: [
      [/[^\\']+$/, 'string', '@popall'],
      [/[^\\']+/, 'string'],
      [/\\./, 'string'],
      [/'/, 'string.escape', '@popall'],
      [/\\$/, 'string'],
    ],
    fDblStringBody: [
      [/[^\\"\{\}]+$/, 'string', '@popall'],
      [/[^\\"\{\}]+/, 'string'],
      [/\{[^\}':!=]+/, 'identifier', '@fStringDetail'],
      [/\\./, 'string'],
      [/"/, 'string.escape', '@popall'],
      [/\\$/, 'string'],
    ],
    dblStringBody: [
      [/[^\\"]+$/, 'string', '@popall'],
      [/[^\\"]+/, 'string'],
      [/\\./, 'string'],
      [/"/, 'string.escape', '@popall'],
      [/\\$/, 'string'],
    ],
    fStringDetail: [
      [/[:][^}]+/, 'string'],
      [/[!][ars]/, 'string'], // only !a, !r, !s are supported by f-strings: https://docs.python.org/3/tutorial/inputoutput.html#formatted-string-literals
      [/=/, 'string'],
      [/\}/, 'identifier', '@pop'],
    ],
  },
};

export function registerCustomPythonLanguage(monaco: ReturnType<typeof useMonaco>) {
  monaco?.languages.register({ id: STRICT_PYTHON3_LANG_ID });
  monaco?.languages.setMonarchTokensProvider(STRICT_PYTHON3_LANG_ID, strictPython3Language);
  monaco?.languages.setLanguageConfiguration(STRICT_PYTHON3_LANG_ID, getConf(monaco));
}
