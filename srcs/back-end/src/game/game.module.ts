import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [GameService, GameGateway, UserService],
  controllers: [GameController],
  imports:[]
})
export class GameModule {}
