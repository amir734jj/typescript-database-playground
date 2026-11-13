import pino from 'pino';

export const logger = pino({
    name: 'sqlite-playground',
    redact: {
        paths: [
            'req.id',
            'req.headers',
            'req.query',
            'req.params',
            'req.body',
            'req.remoteAddress',
            'req.remotePort',
            'res.headers',
            'res.body',
        ],
        remove: true,
    },
    ...(process.env.NODE_ENV !== 'production' && {
        transport: {
            target: 'pino-pretty',
            options: { colorize: process.stdout.isTTY },
        },
    }),
});
