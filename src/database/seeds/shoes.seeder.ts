import { ShoeModel } from 'src/rent/entities/shoe.entity';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export default class ShoesSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(ShoeModel);

    const shoe_230 = {
      size: 230,
      count: 0,
      rentable: 0,
    };
    const shoe_235 = {
      size: 235,
      count: 2,
      rentable: 2,
    };
    const shoe_240 = {
      size: 240,
      count: 4,
      rentable: 4,
    };
    const shoe_245 = {
      size: 245,
      count: 2,
      rentable: 2,
    };
    const shoe_250 = {
      size: 250,
      count: 3,
      rentable: 3,
    };
    const shoe_255 = {
      size: 255,
      count: 1,
      rentable: 1,
    };
    const shoe_260 = {
      size: 260,
      count: 3,
      rentable: 3,
    };
    const shoe_265 = {
      size: 265,
      count: 2,
      rentable: 2,
    };
    const shoe_270 = {
      size: 270,
      count: 4,
      rentable: 4,
    };
    const shoe_275 = {
      size: 275,
      count: 1,
      rentable: 1,
    };
    const shoe_280 = {
      size: 280,
      count: 3,
      rentable: 3,
    };
    const shoe_285 = {
      size: 285,
      count: 2,
      rentable: 2,
    };

    await repository.insert([
      shoe_230,
      shoe_235,
      shoe_240,
      shoe_245,
      shoe_250,
      shoe_255,
      shoe_260,
      shoe_265,
      shoe_270,
      shoe_275,
      shoe_280,
      shoe_285,
    ]);
  }
}
