import { UserModel } from 'src/user/entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(UserModel, (faker) => {
  const user = new UserModel();
  user.name = faker.person.fullName();
  user.studentNumber = faker.number.int({ min: 10000000, max: 99999999 });
  user.birth = faker.date.birthdate();
  user.phone = faker.phone.number();
  user.major = faker.music.genre();
  user.password = faker.internet.password();
  user.isStaff = faker.datatype.boolean({
    probability: 0.5,
  });
  user.currentSemesterMember = faker.datatype.boolean({
    probability: 0.5,
  });
  user.isPaid = faker.datatype.boolean({
    probability: 0.5,
  });

  return user;
});
