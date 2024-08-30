import { Box, Stack, Typography } from '@mui/material';
import { debounce, uniq } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import {
  PythonFunction, PythonName, called_names, defined_functions, imported_names,
} from '../../src/python-analyzer/python_analyzer';
import LibraryName from './LibraryName';

export default function DocumentationStripe({ source } :
{ source: string }) {
  const [parseError, setParseError] = useState(false);
  const [importedNames, setImportedNames] = useState<PythonName[]>([]);
  const [calledNames, setCalledNames] = useState<string[]>([]);
  const [definedFunctions, setDefinedFunctions] = useState<PythonFunction[]>([]);

  const debouncedAnalyze = useMemo(() => {
    const analyze = async (currentSource: string) => {
      try {
        setParseError(false);
        const newCalledNames = called_names(currentSource);
        const newImportedNames = imported_names(currentSource);
        const newDefinedFunctions = defined_functions(currentSource);
        setCalledNames(newCalledNames);
        setImportedNames(newImportedNames);
        setDefinedFunctions(newDefinedFunctions);
      } catch (e) {
        setParseError(true);
      }
    };
    return debounce(analyze, 100);
  }, []);

  useEffect(() => {
    debouncedAnalyze(source);
  }, [source, debouncedAnalyze]);

  return (
    <Box>
      <Stack direction="row" rowGap={0.33} columnGap={1} alignItems="baseline" useFlexGap flexWrap="wrap" marginLeft={1} minHeight="1.5rem">
        {parseError
          ? <Typography variant="body2" sx={{ color: '#cccccc' }}>Syntax Error</Typography>
          : (
            <>
              <Typography variant="body2">
                Docs:
              </Typography>
              {definedFunctions.map(({ name }) => (
                <LibraryName
                  key={name}
                  name={name}
                  module="."
                  smallerFont
                  definedFunctions={definedFunctions}
                />
              ))}
              {uniq(calledNames).map((name) => (
                <LibraryName
                  key={name}
                  name={name}
                  module="builtins"
                  smallerFont
                />
              ))}
              {importedNames.map(({ module, name }) => (
                <LibraryName
                  key={`${module}-${name}`}
                  name={name}
                  module={module}
                  smallerFont
                />
              ))}
            </>
          )}
      </Stack>
    </Box>
  );
}
