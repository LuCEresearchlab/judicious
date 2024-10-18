import { ExpandMore } from '@mui/icons-material';
import {
  Box,
  Chip,
  Stack, Typography,
} from '@mui/material';
import {
  flatten, isEqual, reverse, slice, uniqWith,
} from 'lodash';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import useJudiciousDocData from '../../src/documentation';
import {
  AnalysisResult, analyze,
  PythonFunction,
  PythonName,
} from '../../src/python-analyzer/python_analyzer';
import theme from '../../src/theme';
import DocElement from './DocElement';
import { definedFnToJudiciousFunction } from './utils';

function reverseUniq<T>(array: T[][]): T[] {
  return uniqWith(flatten(reverse(slice(array))), isEqual);
}

const COLLAPSED_HEIGHT = 1.5 * theme.typography.htmlFontSize;

export default function DocumentationStripe({ sources } :
{ sources: string[] }) {
  const { t } = useTranslation();
  const [importedNamesPerCell, setImportedNamesPerCell] = useState<PythonName[][]>([]);
  const [functionsPerCell, setFunctionsPerCell] = useState<PythonFunction[][]>([]);
  const [namesMultipleLines, setNamesMultipleLines] = useState(false);
  const [namesExpanded, setNamesExpanded] = useState(false);

  useEffect(() => {
    const analysesResults : AnalysisResult[] = sources.map((source) => analyze(source));
    const importedNames = analysesResults.map((result) => result.imported_names);
    const possiblyImplicitlyImportedNames = analysesResults.map((result) => result.called_names.map((name) => ({ module: 'builtins', name })));
    setImportedNamesPerCell(importedNames.concat(possiblyImplicitlyImportedNames));
    setFunctionsPerCell(analysesResults.map(
      (result) => result.defined_functions.filter((fn) => fn.name.length > 0),
    ));
  }, [sources]);

  const onResize = useCallback(({ entry } : { entry: ResizeObserverEntry | null }) => {
    const target : HTMLDivElement | null = entry?.target as HTMLDivElement;
    setNamesMultipleLines(target && target.scrollHeight > COLLAPSED_HEIGHT);
  }, []);
  const { ref: elementsRef } = useResizeDetector({ onResize });

  const toggleNamesExpanded = () => setNamesExpanded(!namesExpanded);

  const allImportedNames = reverseUniq(importedNamesPerCell);
  const allDefinedFunctions = reverseUniq(functionsPerCell);

  const modulesToFetch = uniqWith(allImportedNames.map(({ module }) => module), isEqual);

  const modulesData = useJudiciousDocData(modulesToFetch);

  const namesToShow = allDefinedFunctions.map(({ name }) => ({ module: '.', name })).concat(allImportedNames);

  const namesToDocElement = namesToShow.flatMap(({ module, name }) => {
    if (module === '.') {
      const definedFunction = allDefinedFunctions.find((fn) => fn.name === name);
      return definedFunction && [{ module: '.', element: definedFnToJudiciousFunction(definedFunction) }];
    }
    const moduleData = modulesData.find((data) => data?.module === module);
    if (name === '*') {
      return moduleData?.elements.map((element) => ({ module, element }));
    }
    const element = moduleData?.elements?.find((el) => el.name === name);
    return element && [{ module, element }];
  }).filter((element) => element !== undefined);

  if (namesToDocElement.length === 0) {
    return null;
  }

  return (
    <Box>
      <Stack direction="row" columnGap={0.7} alignItems="baseline" useFlexGap marginX={0.5}>
        <Typography variant="body2">
          Docs:
        </Typography>
        <Stack direction="row" rowGap={0.1} columnGap={1} alignItems="baseline" useFlexGap flexWrap="wrap" overflow="hidden" ref={elementsRef} maxHeight={namesExpanded ? 'none' : COLLAPSED_HEIGHT}>
          {namesToDocElement.map(({ module, element }) => (
            <DocElement
              key={`${module}-${element?.name}`}
              module={module}
              element={element}
              smallerFont
            />
          ))}
        </Stack>
        <Chip
          size="small"
          label={namesExpanded ? t('showLess') : t('showAll')}
          deleteIcon={<ExpandMore />}
          sx={{
            flexGrow: '1',
            height: '1rem',
            visibility: namesMultipleLines ? 'visible' : 'hidden',
            '.MuiChip-deleteIcon': {
              transform: `rotate(${namesExpanded ? 180 : 0}deg)`,
              transition: `transform ${theme.transitions.duration.shortest}ms`,
            },
          }}
          onClick={toggleNamesExpanded}
          onDelete={toggleNamesExpanded}
        />
      </Stack>
    </Box>
  );
}
