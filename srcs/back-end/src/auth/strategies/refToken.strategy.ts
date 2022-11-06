import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RefTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh'){
    constructor(private prisma: PrismaService){
        super({
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_REFRESH_TOKEN,
            passReqToCallback: true,
            jwtFromRequest:ExtractJwt.fromExtractors([(request: Request) => {
                let data = request?.cookies["Tokens"];
                if(!data){
                    return null;
                }
                return data.refresh_token
            }])
        })
    }

    async validate(req: Request, payload: any){
        if(!payload){
            throw new BadRequestException('invalid jwt token');
        }
        let refresh_token : string = req?.cookies["Tokens"].refresh_token;
        if(!refresh_token){
            throw new BadRequestException('invalid refresh token');
        }
        return {
            ...payload,
            refresh_token
        };
    }
}