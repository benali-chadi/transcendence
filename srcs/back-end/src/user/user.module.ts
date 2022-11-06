import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserGateway]
})
export class UserModule {}
