import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RelationStatus } from '@prisma/client';
import { validate } from 'class-validator';
import { publicDecrypt } from 'crypto';
import { diskStorage } from 'multer';
import { userInfo } from 'os';
import { CurrentUserDto } from 'src/auth/dto';
import { CurrentUser } from 'src/common/decorators';
import { roomAdmin } from 'src/common/guards/roomAdmin.guard';
import { brotliDecompress } from 'zlib';
import { ChatService } from './chat.service';
import { UserRoomDto, createRoomDto, relationDto, MessageDto, JoinGroup } from './dto';

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService){}

    @Post("create_room")
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('icon',{
        storage: diskStorage({
            destination :'./static/',
            filename : (req, file, cb) =>{
                if (file){
                    //const filename: string = req.user.username;
                    const filename: string = req.body["name"];
                    const extension: string = file.originalname.split('.')
                    .filter(Boolean) 
                    .slice(1)
                    .join('.')
                    cb(null, `${filename}.${extension}`)
                }
            }
        })
    }))
    async createRoom(@CurrentUser() user: CurrentUserDto, @Body() body ,@UploadedFile() file: Express.Multer.File){
        const data : createRoomDto = {
            name: body.name,
            type: body.type,
            password: body.password || "",
            ownerId: user.id
        }
        return await this.chatService.createRoom(data, file);
    }

 
    @Get("group_channels")
    @HttpCode(200)
    async getGroupChannels(@CurrentUser() user: CurrentUserDto){
        const grouchannels = await this.chatService.getGroupChannels(user);
        return grouchannels;
    }

    @Get("all_channels")
    @HttpCode(200)
    async getAllChannels(@CurrentUser() user: CurrentUserDto){
        return await this.chatService.getAllchannels(user.id);
    }

    @Get("Dm_channels")
    @HttpCode(200)
    async getDirectMessages(@CurrentUser() user: CurrentUserDto){
        return await this.chatService.getDirectMessages(user);
    }

    @Post("join_room")
    @HttpCode(200)
    async joinRoom(@CurrentUser() user: CurrentUserDto, @Body("room_id", ParseIntPipe) room_id: number,
    @Body("password") password: string ){
        return await this.chatService.joinRoom(user.id, room_id, password);
    }

    @Post("leave_room")
    @HttpCode(200)
    async leaveRoom(@CurrentUser() user: CurrentUserDto, @Body("room_id", ParseIntPipe) room_id: number){
        return this.chatService.leaveRoom(user.id, room_id);
    }

    @Post("add_member")
    @HttpCode(200)
    @UseGuards(roomAdmin)
    async addUserToRoom(@CurrentUser() user: CurrentUserDto, @Body() data: UserRoomDto){
        return await this.chatService.addUserToChannel(data);
    }

    @Post("remove_member")
    @HttpCode(200)
    @UseGuards(roomAdmin)
    async removeUserfromChannel(@CurrentUser() user: CurrentUserDto, @Body() data: UserRoomDto){
        return await this.chatService.removeUserFromChannel(data);
    }

    @Post("mute_user")
    @HttpCode(200)
    @UseGuards(roomAdmin)
    async muteMember(@CurrentUser() user: CurrentUserDto, @Body() data: UserRoomDto){
        return await this.chatService.muteMember(data);
    }

    @Post("unban")
    @HttpCode(200)
    @UseGuards(roomAdmin)
    async unbanMember(@CurrentUser() user: CurrentUserDto, @Body() data: UserRoomDto){
        return await this.chatService.unbanMember(data.user_id, data.room_id);
    }

    @Post("change_member_role")
    @HttpCode(200)
    async ChangeMemberRole(@CurrentUser() user: CurrentUserDto, @Body() data: UserRoomDto){
        return await this.chatService.ChangeMemberRole(user.id, data.user_id, data.room_id, data.role);
    }
    
    @Delete(":room_id/:password?")
    @HttpCode(200)
    @UseGuards(roomAdmin)
    async deleteChannel(@CurrentUser() user: CurrentUserDto, @Param("room_id", ParseIntPipe) room_id:number, @Param("password") password:string)
    {
        return await this.chatService.deleteChannel(room_id, user.id, password);
    }

    @Get(":room_id")
    @HttpCode(200)
    async getChannelInfo(@CurrentUser() user: CurrentUserDto, @Param("room_id", ParseIntPipe) room_id:number){
        return await this.chatService.getChannelInfo(room_id);
    }

    @Get(":room_id/channel_not_members")
    @HttpCode(200)
    async getUsersNotInGroup(@CurrentUser() user: CurrentUserDto, @Param("room_id", ParseIntPipe) room_id:number){
        return await this.chatService.getUsersNotInGroup(user.id, room_id);
    }

    @Get(":room_id/banned_members")
    @HttpCode(200)
    @UseGuards(roomAdmin)
    async getBannedMembers(@CurrentUser() user: CurrentUserDto, @Param("room_id", ParseIntPipe) room_id:number){
        return await this.chatService.getBannedMembers(room_id);
    }

    @Get(":room_id/channel_members")
    @HttpCode(200)
    async getGroupMembers(@CurrentUser() user: CurrentUserDto, @Param("room_id", ParseIntPipe) room_id:number){
        return await this.chatService.getGroupMembers(user.id, room_id);
    }

    @Post(":id/update_room")
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('icon',{
        storage: diskStorage({
            destination :'./static/',
            filename : (req, file, cb) =>{
                if (file){
                    //const filename: string = req.user.username;
                    const filename: string = req.body["name"];
                    const extension: string = file.originalname.split('.')
                    .filter(Boolean) 
                    .slice(1)
                    .join('.')
                    cb(null, `${filename}.${extension}`)
                }
            }
        })
    }))
    async updateRoom(@CurrentUser() user: CurrentUserDto, @Body() body , @Param("id", ParseIntPipe) room_id:number, @UploadedFile() file: Express.Multer.File){
        const data : createRoomDto = {
            name: body.name,
            type: body.type,
            password: body.password || "",
            ownerId: user.id
        }
        return await this.chatService.updateRoom(data, room_id ,file);
        
    }

}