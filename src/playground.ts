import { isEqual } from 'lodash';

export const playgroundInitialSource = `from math import sqrt
from random import randint

def pythagoras(a: int, b: int) -> float:
    return sqrt(a ** 2 + b ** 2)

shorter_side = randint(2, 5)
longer_side = randint(7, 10)

print(pythagoras(shorter_side, longer_side))`;

export const playgroundActivityVariant = {
  authorSlug: 'judicious',
  activitySlug: 'playground',
  language: 'en',
  version: 'v1',
};

export function isPlayground(
  authorSlug: string,
  activitySlug: string,
  language: string,
  version: string,
) {
  const variant = {
    authorSlug, activitySlug, language, version,
  };
  return isEqual(variant, playgroundActivityVariant);
}
