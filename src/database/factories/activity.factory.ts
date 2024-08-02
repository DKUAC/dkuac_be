import { ActivityModel } from 'src/activity/entities/activity.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(ActivityModel, (faker) => {
  const activity = new ActivityModel();
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const title = faker.word.noun();
  const content = faker.lorem.sentence();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const images = JSON.stringify([faker.image.url()]);
  activity.title = title;
  activity.content = content;
  activity.year = year;
  activity.semester = month < 9 ? 1 : 2;
  activity.date = date;
  activity.images = images;
  return activity;
});
