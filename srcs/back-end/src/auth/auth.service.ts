import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import { Tokens } from "./types";
import * as bcrypt from 'bcrypt';
import { toDataURL } from 'qrcode';
import { authenticator } from 'otplib';
import * as speakeasy  from 'speakeasy'

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService){}

    async   updateRtHash(userId:number, rt: string){
        const hash = await this.hashData(rt);
        await this.prisma.user.update({ 
            where : { 
                id: userId 
            }, 
            data: {
                hashRt: hash
            }})
    }

    async login(dto: AuthDto){
        if (!dto){
            return ;
        }
        let achievement = null;
        let user = await this.prisma.user.findUnique({where:{intraId: dto.intra_id}});
        if (!user){
            user = await this.prisma.user.create({
                data: {
                    username: dto.username,
                    avatar: dto.avatar,
                    intraId: dto.intra_id
                }
            })
            user["first_time"] = true;
            achievement = await this.prisma.achievements.create({
                data:{
                    title:"Novice",
                    desc:"Welcome to our website",
                    user_id: user.id
                }
            })
        } 
        else
            user["first_time"] = false;
        delete user.hashRt;
        delete user.Socket_id;
        if (!user.avatar.includes("cdn"))
            user["avatar"] = process.env.BACK_URL + user.avatar;
        let TFA = await this.prisma.tWO_FA.findUnique({
            where:{
                user_id: user.id
            }
        })
        const TFA_enabled = (!TFA) ? false : TFA.isTwoFactorAuthenticationEnabled;
        const is2fauth = false;
        user["TFA_enabled"] = TFA_enabled;
        const tokens = await this.getTokens(user.id, user.username, TFA_enabled, is2fauth);
        await this.updateRtHash(user.id, tokens.refresh_token);
        user["_level"] = parseFloat(user.level.toString());
        return {tokens, user, achievement};
    }


    async logout(userId: number){
        try{
            await this.prisma.user.updateMany({
                where:{
                    intraId: userId,
                    hashRt:{
                        not: null
                    }
                },
                data:{
                    hashRt: null
                }
            })
        }catch(e){}
    }
    // async refreshToken(userId: number, rt: string){
    //     const user = await this.prisma.user.findUnique({
    //         where:{
    //             id: userId,
    //         }
    //     });
    //     if (!user || !user.hashRt) throw new ForbiddenException("Access Denied");

    //     const rtMatch = await bcrypt.compare(rt, user.hashRt);
    //     if (!rtMatch) throw new ForbiddenException("Access Denied");

    //     const tokens = await this.getTokens(user.id, user.username);
    //     await this.updateRtHash(user.id, tokens.refresh_token);
    //     return tokens;
    // }

    hashData(data:string): Promise<string>{
        return bcrypt.hash(data, 10);
    }

    async getTokens(userId: number, username: string, TFA_enabled: boolean, is2fauth:boolean){
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                id: userId,
                username,
                TFA_enabled,
                is2fauth
            },
            {
                expiresIn: 999999999,
                secret: process.env.JWT_TOKEN
            }),
            this.jwtService.signAsync({
                id: userId,
                username
            },
            {
                expiresIn: 60 * 60 * 24 * 7,
                secret: process.env.JWT_REFRESH_TOKEN
            })
        ]);
        return {
            access_token: at,
            refresh_token: rt
        };
    }

    async turnOnTwoFactorAuthentication(userId: number) {
        try {
            await this.prisma.tWO_FA.upsert({
             where:{
                user_id: userId
             },
             create:{
                isTwoFactorAuthenticationEnabled:true,
                user_id: userId
             },
            update:{
                isTwoFactorAuthenticationEnabled:true,
                user_id: userId
              },
            })
        }catch(e){}
    }
    
      async setTwoFactorAuthenticationSecret(secret: any, userId: number) {
        try {
          await this.prisma.tWO_FA.upsert({
            where:{
              user_id: userId
            },
            create:{
                isTwoFactorAuthenticationEnabled:false,
                twoFactorAuthenticationSecret_base32: secret.base32,
                twoFactorAuthenticationSecret_hex: secret.hex,
                twoFactorAuthenticationSecret_ascii: secret.ascii,
                twoFactorAuthenticationSecret_otpauth_url: secret.otpauth_url,
                user_id: userId
            },
            update:{
                twoFactorAuthenticationSecret_base32: secret.base32,
                twoFactorAuthenticationSecret_hex: secret.hex,
                twoFactorAuthenticationSecret_ascii: secret.ascii,
                twoFactorAuthenticationSecret_otpauth_url: secret.otpauth_url,
            }
          })
        } catch(e){}
      }
    
      async generateQrCodeDataURL(otpAuthUrl: string) {
        return toDataURL(otpAuthUrl);
      }

      async VerifyToken(token: string, userId: number){
        try{
            let TFA = await this.prisma.tWO_FA.findUnique({
                where:{
                    user_id:userId
                }
            });
            const secret = {
                base32: TFA.twoFactorAuthenticationSecret_base32,
                hex: TFA.twoFactorAuthenticationSecret_hex,
                ascii: TFA.twoFactorAuthenticationSecret_ascii,
                otpauth_url: TFA.twoFactorAuthenticationSecret_otpauth_url,
            }
            const verified = speakeasy.totp.verify(
                { secret: secret.base32, encoding: 'base32', token: token }
            );
            return verified;
        }catch(e){
        }
      }

      async returUSer(username: string){
        try{
            let user = await this.prisma.user.findUnique({
                where:{
                    username: username,
                }
            })
            delete user.hashRt;
            delete user.Socket_id;
            let TFA = await this.prisma.tWO_FA.findUnique({
                where:{
                    user_id: user.id
                }
            })
            const TFA_enabled = (!TFA) ? false : TFA.isTwoFactorAuthenticationEnabled;
            user["TFA_enabled"] = TFA_enabled;
            if (!user.avatar.includes("cdn"))
                user.avatar = process.env.BACK_URL + user.avatar;
            return user;
        }catch(e){}
      }

      async disbaleTFA(user_id : number){
        try{
            let disabled = await this.prisma.tWO_FA.update({
                where:{
                    user_id: user_id
                },
                data:{
                    twoFactorAuthenticationSecret_ascii: null,
                    twoFactorAuthenticationSecret_base32: null,
                    twoFactorAuthenticationSecret_hex: null,
                    twoFactorAuthenticationSecret_otpauth_url: null,
                    isTwoFactorAuthenticationEnabled: false
                }
            })
            return disabled;
        }catch(e){}

      }
}