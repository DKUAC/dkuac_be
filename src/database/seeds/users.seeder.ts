import { UserModel } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class UsersSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const repository = dataSource.getRepository(UserModel);
    const user = {
      name: 'jun',
      studentNumber: 12341234,
      birth: new Date(),
      phone: '010-1234-1234',
      major: 'Computer Science',
      password: '1234',
      isStaff: true,
      currentSemesterMember: true,
      isPaid: true,
    };
    await repository.insert([user]);

    const userFactory = factoryManager.get(UserModel);

    await userFactory.saveMany(100);
  }
}
