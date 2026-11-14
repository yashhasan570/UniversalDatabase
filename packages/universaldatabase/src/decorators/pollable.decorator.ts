import { Inject, Logger } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { JobTypes } from '~/interface/Jobs';
import { UniversalDatabaseJobsService } from '~/services/universaldatabase-jobs.service';
import { serializeWorkerArgs } from '~/helpers/serialize-worker-args';

const nanoidv2 = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 14);

const logger = new Logger('Pollable');

/**
 * Decorator that makes a service method async-pollable.
 *
 * Instead of blocking until the method completes, the caller receives
 * { id: jobId } immediately. The actual work runs in the job queue
 * (Bull with Redis, or fallback p-queue). The frontend polls
 * /jobs/listen for the result.
 *
 * Usage:
 *   @Pollable()
 *   async predictSchema(context, params) { ... }
 *
 * The processor calls __original to bypass the decorator.
 */
export function Pollable(): MethodDecorator {
  const injectUniversalDatabaseJobsService = Inject(UniversalDatabaseJobsService);

  return (target, key, descriptor: PropertyDescriptor) => {
    injectUniversalDatabaseJobsService(target, '_nocoJobsService');

    const service = target.constructor.name;
    const method = key.toString();
    const originalMethod = descriptor.value;

    const wrappedFn = async function (...args: any[]) {
      const nocoJobsService: UniversalDatabaseJobsService = this._nocoJobsService;

      if (!nocoJobsService) {
        logger.warn(
          `UniversalDatabaseJobsService not available for ${service}.${method} — executing synchronously (this should not happen in production)`,
        );
        return originalMethod.apply(this, args);
      }

      const serializedArgs = serializeWorkerArgs(args, method, service);

      const jobId = `job${nanoidv2()}`;

      const job = await nocoJobsService.add(
        JobTypes.UseWorker,
        { service, method, args: serializedArgs },
        { jobId },
      );

      return { id: job.id };
    };

    // Store original so UseWorkerProcessor can bypass the decorator
    wrappedFn['__original'] = originalMethod;

    descriptor.value = wrappedFn;

    return descriptor;
  };
}
