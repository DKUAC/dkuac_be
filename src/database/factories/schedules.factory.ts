import { ScheduleModel } from 'src/schedule/entities/schedule.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(ScheduleModel, (faker) => {
  const schedule = new ScheduleModel();
  const date = faker.date.future();
  date.setHours(0, 0, 0, 0);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const semester = month >= 3 && month <= 8 ? 1 : 2;
  schedule.title = faker.lorem.sentence();
  schedule.content = faker.lorem.paragraph();
  schedule.year = year;
  schedule.month = month;
  schedule.day = day;
  schedule.date = date;
  schedule.semester = semester;

  return schedule;
});
