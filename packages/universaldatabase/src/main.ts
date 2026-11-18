import cors from 'cors';
import express from 'express';
import UniversalDatabase from '~/UniversalDatabase';

const server = express();
server.disable('etag');
server.disable('x-powered-by');
server.use(
  cors({
    exposedHeaders:
      'xc-db-response, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Policy, Retry-After',
  }),
);

server.set('view engine', 'ejs');

async function bootstrap() {
  const httpServer = server.listen(process.env.PORT || 8080, async () => {
    server.use(await UniversalDatabase.init({}, httpServer, server));
  });
}

bootstrap();
