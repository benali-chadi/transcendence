import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request, Response} from 'express';
import { AuthDto, CurrentUserDto } from "./dto";
import { Tokens } from "./types";
import { User } from "@prisma/client";
import { CurrentUser, Public } from "src/common/decorators";
import { JwtGuard, Jwt_TFA_Guard ,JwtRefreshGuard, OauthGuard } from "src/common/guards";
import { UserService } from "src/user/user.service";
import * as speakeasy  from 'speakeasy'

@Controller('auth')
export class AuthController {
    constructor(private readonly AuthService: AuthService) {}

    @Get()
    @Public()
    @UseGuards(OauthGuard)
    async Auth(@Req() req: Request){
        
    }

    @Get('redirect')
    @Public()
    @UseGuards(OauthGuard)
    @HttpCode(HttpStatus.OK)
    async AuthRedirect(@CurrentUser() dto: AuthDto, @Res({ passthrough:true }) res: Response){
        const Tokens = await this.AuthService.login(dto);
        res.cookie('access_token', Tokens.tokens.access_token, { httpOnly: true});
        res.cookie('refresh_token', Tokens.tokens.access_token, { httpOnly: true});
        return {achievement: Tokens.achievement, user: Tokens.user};
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@CurrentUser() dto: AuthDto, @Res({ passthrough:true }) res: Response){
        await this.AuthService.logout(dto.intra_id);
        res.cookie('access_token', "", {httpOnly: true, maxAge: 0});
        res.cookie('refresh_token', "", {httpOnly: true, maxAge: 0});
        return {message: "user logged out"};
    }

    // @Get('refreshToken')
    // @Public()
    // @UseGuards(JwtRefreshGuard)
    // @HttpCode(HttpStatus.OK)
    // async refreshToken(@CurrentUser() user, @Res({ passthrough:true }) res: Response) : Promise<Tokens>{
    //     const Tokens = await this.AuthService.refreshToken(user.id, user.refresh_token);
    //     res.cookie('Tokens', Tokens, {httpOnly: true});
    //     return Tokens;
    // }

    @Post('enable-2FA')
    @HttpCode(HttpStatus.OK)
    async generateQrCode(@CurrentUser() user: CurrentUserDto){
        const secret = speakeasy.generateSecret()
        await this.AuthService.setTwoFactorAuthenticationSecret(secret, user.id);
        const qrCode = await this.AuthService.generateQrCodeDataURL(secret.otpauth_url);
        return qrCode;
    }

    @Post('validate-2Fa-token')
    @HttpCode(HttpStatus.OK)
    async validatetoken(@CurrentUser() user: CurrentUserDto, @Res({ passthrough:true }) res: Response ,@Body("token") token : string){
        const verified : boolean =  await this.AuthService.VerifyToken(token, user.id);
        if (verified)
        {
            await this.AuthService.turnOnTwoFactorAuthentication(user.id);
            const tokens = await this.AuthService.getTokens(user.id, user.username, true, true);
            const _user =  await this.AuthService.returUSer(user.username);
            res.cookie('access_token', tokens.access_token, { httpOnly: true});
            res.cookie('refresh_token', tokens.access_token, { httpOnly: true});
            return _user;
        } 
        else 
            throw new HttpException("Invalid Token", 409);
    }

    @Post("2fa/login")
    @Public()
    @UseGuards(JwtGuard)
    @HttpCode(HttpStatus.OK)
    async login_2fa(@CurrentUser() user: CurrentUserDto, @Res({ passthrough:true }) res: Response, @Body("token") token: string){
        const verified : boolean =  await this.AuthService.VerifyToken(token, user.id);
        if (verified)
        {
            const tokens = await this.AuthService.getTokens(user.id, user.username, true, true);
            const _user =  await this.AuthService.returUSer(user.username);
            res.cookie('access_token', tokens.access_token, { httpOnly: true});
            res.cookie('refresh_token', tokens.access_token, { httpOnly: true});
            _user["_level"] = parseFloat(_user.level.toString());
            return _user;
        } 
        else 
            throw new HttpException("Invalid Token", 409);
    }

    @Post("disbale-2fa")
    @HttpCode(HttpStatus.OK)
    async disableTFA(@CurrentUser() user: CurrentUserDto, @Body("token") token: string){
        const verified : boolean =  await this.AuthService.VerifyToken(token, user.id);
        if (verified)
        {
            await this.AuthService.disbaleTFA(user.id);
            return await this.AuthService.returUSer(user.username);
        } 
        else 
            throw new HttpException("Invalid Token", 409);
    }
}