import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class AuthTokenTFAStrategy extends PassportStrategy(Strategy, 'jwt-2ft'){
    constructor(){
        super({
            secretOrKey: process.env.JWT_TOKEN,
            ignoreExpiration: false,
            jwtFromRequest:ExtractJwt.fromExtractors([(request: Request) => {
                let data = request?.cookies["access_token"];
                if(!data){
                    return null;
                }
                return data
            }])
        });
    }

    validate(payload: any){
        if (payload === null)
            throw new UnauthorizedException();
        if (!payload.TFA_enabled)
            return payload;
        if (!payload.is2fauth)
            throw new UnauthorizedException();
        return payload;
    }
}