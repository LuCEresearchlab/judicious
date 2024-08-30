export type JudiciousDocModule = {
  module: string;
  elements: (JudiciousDocFunction | JudiciousDocType | JudiciousDocConstant)[];
};

export type JudiciousDocFunction = {
  kind: 'function';
  name: string;
  description: JudiciousDocDescription;
  parameters: JudiciousDocParameter[];
  returnValue?: {
    type: string;
    description: string;
  };
  sideEffects?: boolean;
};

export type JudiciousDocDescription = {
  p: string[];
  figure?: {
    url: string;
    caption: string;
  };
};

export type JudiciousDocParameter = {
  name: string;
  type: string;
  description: string;
  default?: string;
  variableLength?: boolean;
};

export type JudiciousDocType = {
  kind: 'type';
} & JudiciousDocSimpleElement;

export type JudiciousDocConstant = {
  kind: 'constant';
  type: string;
} & JudiciousDocSimpleElement;

export type JudiciousDocSimpleElement = {
  name: string;
  description: JudiciousDocDescription;
};
