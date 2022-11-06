import {ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { WsException } from "@nestjs/websockets";
import { Observable } from "rxjs";

@Injectable()
export class WsGuard extends AuthGuard('ws-jwt'){
    constructor(private reflector: Reflector){
        super();
    }

    handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
        try {
            return super.handleRequest(err, user, info, context, status);
        } catch{
            throw new WsException("Unauthorized");
        }
    }
}