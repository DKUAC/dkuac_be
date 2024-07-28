import { UserModel } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class UsersSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const repository = dataSource.getRepository(UserModel);
    const staff_paid_user = {
      name: 'jun',
      studentNumber: 12341234,
      birth: new Date(),
      phone: '010-1234-1234',
      major: 'Computer Science',
      password: '$2b$10$mGP6UuOYuSzBu3Nyggur3OtbbXq.lKybOk7tiFjHewjl9qpqeZ6Dy',
      isStaff: true,
      currentSemesterMember: true,
      isPaid: true,
    };

    const normal_paid_user = {
      name: 'kim',
      studentNumber: 23452345,
      birth: new Date(),
      phone: '010-1234-1234',
      major: 'Computer Science',
      password: '$2b$10$mGP6UuOYuSzBu3Nyggur3OtbbXq.lKybOk7tiFjHewjl9qpqeZ6Dy',
      isStaff: false,
      currentSemesterMember: true,
      isPaid: true,
    };

    const normal_not_paid_user = {
      name: 'choi',
      studentNumber: 34563456,
      birth: new Date(),
      phone: '010-1234-1234',
      major: 'Computer Science',
      password: '$2b$10$mGP6UuOYuSzBu3Nyggur3OtbbXq.lKybOk7tiFjHewjl9qpqeZ6Dy',
      isStaff: false,
      currentSemesterMember: true,
      isPaid: false,
    };

    const normal_not_this_semester_user = {
      name: 'park',
      studentNumber: 45674567,
      birth: new Date(),
      phone: '010-1234-1234',
      major: 'Computer Science',
      password: '$2b$10$mGP6UuOYuSzBu3Nyggur3OtbbXq.lKybOk7tiFjHewjl9qpqeZ6Dy',
      isStaff: false,
      currentSemesterMember: false,
      isPaid: false,
    };

    await repository.insert([
      staff_paid_user,
      normal_paid_user,
      normal_not_this_semester_user,
      normal_not_paid_user,
    ]);

    const userFactory = factoryManager.get(UserModel);

    await userFactory.saveMany(3000);
  }
}
