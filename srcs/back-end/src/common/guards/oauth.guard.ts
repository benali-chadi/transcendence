import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OauthGuard extends AuthGuard('oauth2') {
    constructor(){
        super();
    }

    handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
        try {
            return super.handleRequest(err, user, info, context, status);
        } catch{
            throw new ForbiddenException();
        }
    }
}