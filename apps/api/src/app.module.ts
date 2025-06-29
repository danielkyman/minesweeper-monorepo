import 'reflect-metadata';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Game } from './entities/game.entity';
import { GameCell } from './entities/game-cell.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '0.0.0.0',
      port: 5432,
      username: 'local',
      password: 'local',
      database: 'local',
      entities: [join(__dirname, 'entities/*')],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Game, GameCell]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class AppModule {}
