import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { JudiciousModule } from './schemas/documentation';

export function judiciousDocPathname(module: string) {
  return `/docs/${module}.json`;
}

export default function useJudiciousDocData(modules: string[]) {
  const results = useQueries({
    queries: modules.map((module) => ({
      queryKey: [module],
      queryFn: (): Promise<JudiciousModule> => axios.get(judiciousDocPathname(module))
        .then((response) => response.data),
    })),
  });
  return results.map((result) => result.data)
    .filter((data) => data !== undefined);
}

export const allKinds = {
  function: { id: 'function', label: 'Function', priority: 0 },
  constant: { id: 'constant', label: 'Constant', priority: 1 },
  type: { id: 'type', label: 'Type', priority: 2 },
};
