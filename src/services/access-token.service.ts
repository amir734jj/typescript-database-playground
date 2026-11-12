import { Op } from 'sequelize';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AccessToken } from '../entities';

@Injectable()
export class AccessTokenService {
    create(data: { userId: number; tokenHash: string; expiresAt: Date }): Promise<AccessToken> {
        return AccessToken.create(data);
    }

    findValid(
        tokenHash: string,
        userId: number,
        now = DateTime.utc().toJSDate(),
    ): Promise<AccessToken | null> {
        return AccessToken.findOne({
            where: { tokenHash, userId, expiresAt: { [Op.gt]: now } },
        });
    }

    async revoke(tokenHash: string): Promise<void> {
        await AccessToken.destroy({ where: { tokenHash } });
    }
}
