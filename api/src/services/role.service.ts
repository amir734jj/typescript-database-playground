import { Transaction } from 'sequelize';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UserRoleName } from '../enums';
import { Role, User, UserRole } from '../entities';

@Injectable()
export class RoleService {
    constructor(@Inject(Sequelize) private readonly sequelize: Sequelize) {}

    async assignInitialRoles(userId: string, isFirstUser: boolean): Promise<void> {
        const basicRole = await this.findRole(UserRoleName.BASIC);
        const roles = [basicRole];
        if (isFirstUser) {
            roles.push(await this.findRole(UserRoleName.ADMIN));
        }
        await UserRole.bulkCreate(roles.map((role) => ({ userId, roleId: role.id })));
    }

    async hasRole(userId: string, roleName: UserRoleName): Promise<boolean> {
        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) {
            throw new Error(`Required role ${roleName} is missing.`);
        }
        return (await UserRole.count({ where: { userId, roleId: role.id } })) > 0;
    }

    listUsers(): Promise<User[]> {
        return User.findAll({
            attributes: ['id', 'name', 'age', 'email'],
            include: [{ model: Role, attributes: ['name'], through: { attributes: [] } }],
            order: [['id', 'ASC']],
        });
    }

    async setRole(userId: string, roleName: UserRoleName): Promise<User> {
        return this.sequelize.transaction({ type: Transaction.TYPES.IMMEDIATE }, async () => {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new NotFoundException('User not found.');
            }

            const [basicRole, adminRole] = await Promise.all([
                this.findRole(UserRoleName.BASIC),
                this.findRole(UserRoleName.ADMIN),
            ]);
            const currentlyAdmin = (await UserRole.count({
                where: { userId, roleId: adminRole.id },
            })) > 0;
            if (currentlyAdmin && roleName === UserRoleName.BASIC) {
                const adminCount = await UserRole.count({ where: { roleId: adminRole.id } });
                if (adminCount <= 1) {
                    throw new ConflictException('Cannot remove the last administrator.');
                }
            }

            const roles = roleName === UserRoleName.ADMIN ? [basicRole, adminRole] : [basicRole];
            await UserRole.destroy({ where: { userId } });
            await UserRole.bulkCreate(roles.map((role) => ({ userId, roleId: role.id })));

            const updatedUser = await User.findByPk(userId, {
                include: [{ model: Role, attributes: ['name'], through: { attributes: [] } }],
            });
            if (!updatedUser) {
                throw new Error('User disappeared while updating roles.');
            }
            return updatedUser;
        });
    }

    async deleteUser(userId: string): Promise<void> {
        await this.sequelize.transaction({ type: Transaction.TYPES.IMMEDIATE }, async () => {
            const adminRole = await this.findRole(UserRoleName.ADMIN);
            const userIsAdmin = (await UserRole.count({
                where: { userId, roleId: adminRole.id },
            })) > 0;
            if (userIsAdmin) {
                const adminCount = await UserRole.count({ where: { roleId: adminRole.id } });
                if (adminCount <= 1) {
                    throw new ConflictException('Cannot delete the last administrator.');
                }
            }
            await User.destroy({ where: { id: userId } });
        });
    }

    private async findRole(name: UserRoleName): Promise<Role> {
        const role = await Role.findOne({ where: { name } });
        if (!role) {
            throw new Error(`Required role ${name} is missing.`);
        }
        return role;
    }
}
