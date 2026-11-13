import { Injectable } from '@nestjs/common';
import { Role, User } from '../entities';

@Injectable()
export class UserService {
    findByEmail(email: string): Promise<User | null> {
        return User.findOne({ where: { email } });
    }

    findById(id: string): Promise<User | null> {
        return User.findByPk(id, {
            include: [{ model: Role, attributes: ['name'], through: { attributes: [] } }],
        });
    }

    create(
        data: { name: string; age: number; email: string; passwordHash: string },
    ): Promise<User> {
        return User.create(data);
    }

    async update(
        id: string,
        data: { name?: string; age?: number; email?: string },
    ): Promise<User | null> {
        const user = await User.findByPk(id);
        if (!user) {
            return null;
        }
        await user.update(data);
        return user;
    }

    async delete(id: string): Promise<boolean> {
        return (await User.destroy({ where: { id } })) > 0;
    }
}
