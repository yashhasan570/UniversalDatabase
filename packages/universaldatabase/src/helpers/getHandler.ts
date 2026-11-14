import type express from 'express';
import Universal Database from '~/Universal Database';

export default function getHandler(
  defaultHandler: express.Handler,
  eeHandler: express.Handler,
): express.Handler {
  return async (...args) => {
    if (UniversalDatabase.isEE()) {
      return defaultHandler(...args);
    }
    return eeHandler(...args);
  };
}

export function getConditionalHandler<
  T extends (...args: any[]) => any,
  U extends (...args: any[]) => any,
>(
  defaultHandler: T,
  eeHandler: U,
): (
  ...args: Parameters<T> | Parameters<U>
) => Promise<ReturnType<T> | ReturnType<U>> {
  return async (...args: Parameters<T> | Parameters<U>) => {
    if (UniversalDatabase.isEE()) {
      return defaultHandler(...args);
    }
    return eeHandler(...args);
  };
}
