import { ScheduleModel } from 'src/schedule/entities/schedule.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class SchedulesSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const scheduleFactory = factoryManager.get(ScheduleModel);
    await scheduleFactory.saveMany(3000);
  }
}
