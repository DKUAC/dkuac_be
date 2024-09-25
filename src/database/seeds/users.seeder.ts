import { ActivityModel } from 'src/activity/entities/activity.entity';
import { UserModel } from 'src/auth/user/entities/user.entity';
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
    }; // 집행부(권한 모두 있음)

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
    }; // 이번 학기 회원(회비 지불)

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
    }; // 이번 학기 회원(회비 미지불)

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
    }; // 일반 회원가입(회원 아닌 사람)

    await repository.insert([
      staff_paid_user,
      normal_paid_user,
      normal_not_this_semester_user,
      normal_not_paid_user,
    ]);

    const userFactory = factoryManager.get(UserModel);

    await userFactory.saveMany(3000);

    // const activityFactory = factoryManager.get(ActivityModel);

    // for (let i = 0; i < 1000; i++) {
    //   const activity = await activityFactory.make();
    //   activity.Author = await repository.findOne({ where: { isStaff: true } });
    //   await activityFactory.save(activity);
    // }
  }
}
