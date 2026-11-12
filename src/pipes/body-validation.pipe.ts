import { BadRequestException, ValidationPipe, type ArgumentMetadata } from '@nestjs/common';
import _ from 'lodash';

export class BodyValidationPipe extends ValidationPipe {
    constructor() {
        super({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (errors) => new BadRequestException({
                message: errors.flatMap((error) => Object.values(error.constraints ?? {})).join(' '),
            }),
        });
    }

    override async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
        if (metadata.type === 'body' && metadata.data === undefined && !_.isPlainObject(value)) {
            throw new BadRequestException('Request body must be an object.');
        }
        return super.transform(value, metadata);
    }
}
