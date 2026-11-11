import { faker } from '@faker-js/faker';
import _ from 'lodash';
import { sequelize } from './database.ts';
import { Project, User } from './entities';
import { logger } from './tools/logger.ts';

const userCount = 10000000;
const projectsPerUser = 3;
const batchSize = 10000;

export async function seedData(): Promise<void> {
    for (let offset = 0; offset < userCount; offset += batchSize) {
        await sequelize.transaction(async () => {
            const users = await User.bulkCreate(
                _.times(Math.min(batchSize, userCount - offset), () => ({
                    name: faker.person.fullName(),
                    age: faker.number.int({ min: 18, max: 80 }),
                    email: `${faker.string.uuid()}@example.test`,
                })),
            );

            await Project.bulkCreate(
                users.flatMap((user) =>
                    _.times(projectsPerUser, () => ({
                    name: faker.company.catchPhrase(),
                    description: faker.lorem.sentence(),
                    userId: user.id,
                })),
                ),
            );
        });

        const batch = Math.floor(offset / batchSize) + 1;
        logger.info({ batch, totalBatches: Math.ceil(userCount / batchSize) }, 'Finished batch');
    }

    console.log(`Added ${userCount} users and ${userCount * projectsPerUser} projects.`);
}
