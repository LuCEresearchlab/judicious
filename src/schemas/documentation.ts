export type JudiciousModule = {
  module: string;
  summary: string;
  elements: JudiciousElement[];
};

export type JudiciousElement = JudiciousFunction | JudiciousType | JudiciousConstant;

export type JudiciousFunction = {
  kind: 'function';
  name: string;
  description: JudiciousDescription;
  parameters: JudiciousParameter[];
  returnValue?: {
    type: string;
    description: string;
  };
  sideEffects?: boolean;
};

export type JudiciousDescription = {
  p: string[];
  figure?: {
    url: string;
    caption: string;
  };
};

export type JudiciousParameter = {
  name: string;
  type: string;
  description: string;
  default?: string;
  variableLength?: boolean;
};

export type JudiciousType = {
  kind: 'type';
} & JudiciousSimpleElement;

export type JudiciousConstant = {
  kind: 'constant';
  type: string;
} & JudiciousSimpleElement;

export type JudiciousSimpleElement = {
  name: string;
  description: JudiciousDescription;
};
