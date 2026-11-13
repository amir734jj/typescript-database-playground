import { BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

export function routeId(value: string): string {
    if (!isUUID(value, '4')) {
        throw new BadRequestException('id must be a UUID.');
    }
    return value;
}
