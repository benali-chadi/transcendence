import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SlowBuffer } from 'buffer';
import { diskStorage } from 'multer';
import path from 'path';
import { CurrentUserDto } from 'src/auth/dto';
import { CurrentUser } from 'src/common/decorators';
import { UserService } from './user.service';
import { v4 as uuidv4 } from 'uuid';
import { relationDto } from 'src/chat/dto';
import { RelationStatus } from '@prisma/client';
import { IsString } from 'class-validator';

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @Get('me')
    @HttpCode(200)
    async getMe(@CurrentUser() user: CurrentUserDto){
        return this.userService.getMe(user.id);
    }

    @Get('all')
    @HttpCode(200)
    async getAllUsers(@CurrentUser() user: CurrentUserDto){
        return this.userService.getAllUsers(user.id);
    }

    @Post("update_profile")
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('avatar',{
        storage: diskStorage({
            destination :'./static/',
            filename : (req, file, cb) =>{
                if (file){
                    //const filename: string = req.user.username;

                    const filename: string = req.user["username"];
                    const extension: string = file.originalname.split('.')
                    .filter(Boolean) 
                    .slice(1)
                    .join('.')
                    cb(null, `${filename}.${extension}`)
                }
            }
        })
    }))
    async updateProfile(@CurrentUser() user: CurrentUserDto,@Body("username") username:string, @UploadedFile() file: Express.Multer.File){
        
        return await this.userService.updateProfile(user.id, username, file);
    }

    @Post("block_user")
    @HttpCode(200)
    async blockUser(@CurrentUser() user: CurrentUserDto, @Body("to_block", ParseIntPipe) id:number){

        return await this.userService.blockUser(user.id, id);
    }

    @Post("unblock_user")
    @HttpCode(200)
    async unblockUser(@CurrentUser() user:CurrentUserDto, @Body("to_unblock", ParseIntPipe) id:number){
        return await this.userService.unblockUser(user.id, id);
    }

    @Post("add_friend")
    @HttpCode(200)
    async sendFriendReq(@CurrentUser() user: CurrentUserDto, @Body("user") id:number){

        const data: relationDto = {
            status: RelationStatus.Requested,
            addressed_id: id
        };
        return await this.userService.sendFriendRequest(user.id, data);
    }


    @Post("accept_friend")
    @HttpCode(200)
    async acceptFriendReq(@CurrentUser() user: CurrentUserDto, @Body("user") id:number){
        return await this.userService.acceptFriendReq(user.id, id);
    }

    @Post("unfriend")
    @HttpCode(200)
    async removeFriend(@CurrentUser() user: CurrentUserDto, @Body("user") id:number){
        return await this.userService.deleteFriend(user.id, id);
    }

    @Get("friends")
    @HttpCode(200)
    async getAllFriends(@CurrentUser() user: CurrentUserDto){
        return await this.userService.getFriends(user.id, user.username);
    }

    @Get("friend_requests")
    async getFriendrequestes(@CurrentUser() user: CurrentUserDto){
        return await this.userService.getFriendReqs(user.id);
    }

    @Get(':username')
    async getUserByUsername(@CurrentUser() user: CurrentUserDto, @Param('username') username: string){
        return await this.userService.getUserByUsername(user.id, username);
    }

    @Get(':username/achievements')
    async getAchievements(@CurrentUser() user: CurrentUserDto, @Param('username') username: string){
        return await this.userService.getAchievements(user.id, username);
    }

    @Get(':username/friends')
    async getUserFriends(@CurrentUser() user: CurrentUserDto, @Param('username') username: string){
        return await this.userService.getFriends(user.id, username);
    }
}
