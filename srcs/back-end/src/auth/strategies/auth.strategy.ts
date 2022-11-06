import { ForbiddenException, Injectable } from "@nestjs/common";
import { config } from 'dotenv';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { map, lastValueFrom } from "rxjs";
import {HttpService} from '@nestjs/axios';

config();

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'oauth2'){
    
    constructor(private readonly httpService: HttpService) {
        super({
            authorizationURL: process.env.AUTHORIZATION_URL ,
            tokenURL: process.env.TOKEN_URL ,
            clientID: process.env.INTRA_API_UID,
            clientSecret: process.env.INTRA_API_KEY,
            callbackURL: process.env.CALLBACK_URL,
            scope: ['public'],
        });
    }

    async validate (accessToken: string): Promise<any> {
        const headersRequest = {
            'Authorization': `Bearer ${accessToken}`,
        };
        const observable = this.httpService.get('https://api.intra.42.fr/v2/me', { headers: headersRequest }).pipe(map((res) => res.data));
        const result = await lastValueFrom(observable);
        const user = {
            username: result.login,
            avatar: result.image_url,
            intra_id: result.id
        }
        return user;
    }
}