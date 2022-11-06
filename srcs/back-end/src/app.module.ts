import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { GameGateway } from './game/game.gateway';
import { GameModule } from './game/game.module';
import { UserService } from './user/user.service';

@Module({
  imports: [AuthModule, PrismaModule, ChatModule, UserModule, GameModule],
})
export class AppModule {}
