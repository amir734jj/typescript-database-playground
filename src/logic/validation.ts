import { BadRequestException } from '@nestjs/common';

export function routeId(value: string): number {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id < 1) {
        throw new BadRequestException('id must be a positive integer.');
    }
    return id;
}
