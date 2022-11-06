import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import cookieParser from "cookie-parser";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Socket } from "socket.io";
import * as cookie from "cookie"
import  { Tokens } from "../types"
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsAuthStrategy extends PassportStrategy(Strategy, 'ws-jwt'){
    constructor(){
        super({
            secretOrKey: process.env.JWT_TOKEN,
            ignoreExpiration: false,
            jwtFromRequest:(client: Socket) => {
                let data : any = null;
                if (client.handshake.headers.cookie)
                    data  = cookie.parse(client.handshake.headers.cookie);
                if (!data || !data.access_token)
                    return null;
                return data.access_token;
            }
        });
    }
    validate(payload: any){
        if (payload === null)
            throw new WsException("Unauthorized");
        if (!payload.TFA_enabled)
            return payload;
        if (!payload.is2fauth)
            throw new WsException("Unauthorized");
        return payload;
    }
}