/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
import {
  Box,
  Chip,
  Divider,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import { JudiciousDocFunction } from '../../src/schemas/documentation';
import theme from '../../src/theme';
import CodeElement from './CodeElement';
import ConfigButtons, { SHOW_DIAGRAM_KEY, SHOW_OPTIONAL_KEY, SHOW_TYPES_KEY } from './ConfigButtons';
import FunctionDiagram from './FunctionDiagram';
import {
  hoverProps,
  moduleId,
  nameId,
  paramId,
  returnId, sentence, visibleParameters,
} from './utils';

export default function FunctionDocumentation({ fn, module } :
{ fn: JudiciousDocFunction, module: string }) {
  const [hoverElement, setHoverElement] = useState<string>('');
  const {
    name, description, parameters, returnValue,
  } = fn;
  const { docsMetadata } = useLocalProfile();
  const params = visibleParameters(parameters, docsMetadata.showOptional);
  const hasOptionalParams = parameters.some((param) => param.default !== undefined
    || param.variableLength);
  const hasTypes = parameters.some((param) => param.type !== '')
    || (returnValue && returnValue.type !== '');
  const availableOptions = [];
  if (hasOptionalParams) { availableOptions.push(SHOW_OPTIONAL_KEY); }
  if (hasTypes) { availableOptions.push(SHOW_TYPES_KEY); }
  availableOptions.push(SHOW_DIAGRAM_KEY);
  return (
    <>
      <Box mb={1}>
        <Box sx={{ display: 'flex' }}>
          <span>
            <Typography color={theme.custom.redColor} fontWeight="bold" component="span">
              Function
            </Typography>
            <Typography color="text.secondary" component="span" sx={{ whiteSpace: 'pre' }}>
              {' from '}
            </Typography>
            <Typography color="text.secondary" component="span" {...hoverProps(moduleId(), hoverElement, setHoverElement)}>
              {module === '.' ? 'your code' : `library ${module}`}
            </Typography>
            {fn.sideEffects && (
            <Chip size="small" label="Side Effects" color="error" variant="filled" sx={{ ml: 1 }} />
            )}
          </span>
          <ConfigButtons available={availableOptions} />
        </Box>
        <Typography>
          <span {...hoverProps(nameId(), hoverElement, setHoverElement)}>
            <CodeElement bold>{name}</CodeElement>
          </span>
          <CodeElement>(</CodeElement>
          {params.map((param, i) => (
            <span
              key={i}
            >
              {i > 0 && <CodeElement>,&nbsp;</CodeElement>}
              <span {...hoverProps(paramId(i), hoverElement, setHoverElement)}>
                {param.variableLength && docsMetadata.showOptional && <CodeElement>*</CodeElement>}
                <CodeElement>{param.name}</CodeElement>
                {param.type && docsMetadata.showTypes && (
                <>
                  <CodeElement>:</CodeElement>
                  <CodeElement>&nbsp;</CodeElement>
                  <CodeElement type>{param.type}</CodeElement>
                </>
                )}
                {param.default && (
                <>
                  <CodeElement>&nbsp;</CodeElement>
                  <CodeElement>=</CodeElement>
                  <CodeElement>&nbsp;</CodeElement>
                  <CodeElement>{param.default}</CodeElement>
                </>
                )}
              </span>
            </span>
          ))}
          <CodeElement>)</CodeElement>
          {returnValue && docsMetadata.showTypes && (
          <Box component="span" {...hoverProps(returnId(), hoverElement, setHoverElement)}>
            <CodeElement>&nbsp;</CodeElement>
            <CodeElement type>→</CodeElement>
            <CodeElement>&nbsp;</CodeElement>
            <CodeElement type>{returnValue.type}</CodeElement>
          </Box>
          )}
        </Typography>
      </Box>
      {docsMetadata.showDiagram && (
      <FunctionDiagram
        fn={fn}
        module={module}
        hoverElement={hoverElement}
        setHoverElement={setHoverElement}
      />
      )}
      <Box sx={{ mt: 2 }} />
      {description.p.map((p, idx) => (
        <Typography key={idx} color="text.secondary" gutterBottom>
          {sentence(p)}
        </Typography>
      ))}
      {params.length > 0 && params.some((param) => param.description.length > 0) && (
        <>
          <Divider sx={{ mt: 3, mb: 1 }}>Parameters</Divider>
          {params.map((param, i) => (
            <Typography
              gutterBottom
              key={i}
              {...hoverProps(paramId(i), hoverElement, setHoverElement)}
            >
              <CodeElement>{param.name}</CodeElement>
              <Typography color="text.secondary" component="span" ml="1ch">
                {param.description}
              </Typography>
            </Typography>
          ))}
        </>
      )}
      {returnValue && returnValue.description.length > 0 && (
        <>
          <Divider sx={{ mt: 3, mb: 1 }}>Return</Divider>
          <Typography
            color="text.secondary"
            component="span"
            {...hoverProps(returnId(), hoverElement, setHoverElement)}
          >
            {sentence(returnValue.description)}
          </Typography>
        </>
      )}
    </>
  );
}
