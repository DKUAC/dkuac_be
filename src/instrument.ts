// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const configService = new ConfigService();

Sentry.init({
  dsn: configService.get<string>('SENTRY_DSN'),
  integrations: [nodeProfilingIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
