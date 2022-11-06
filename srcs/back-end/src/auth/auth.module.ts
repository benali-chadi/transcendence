import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthStrategy } from './strategies/auth.strategy';
import {HttpModule} from '@nestjs/axios'
import { JwtModule } from '@nestjs/jwt';
import {  AuthTokenTFAStrategy } from './strategies/Jwt_2fa.strategy';
import { RefTokenStrategy } from './strategies/refToken.strategy';
import { WsAuthStrategy } from './strategies/wsAuth.strategy';
import { AuthTokenStrategy } from './strategies';

@Module({
  imports: [HttpModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthStrategy, AuthTokenStrategy, RefTokenStrategy, WsAuthStrategy, AuthTokenTFAStrategy]
})
export class AuthModule {}