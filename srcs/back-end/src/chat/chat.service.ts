import { ConsoleLogger, ForbiddenException, HttpException, Injectable, UseGuards } from '@nestjs/common';
import { ChatroomType, Prisma, RelationStatus, RoomMemberRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRoomDto, createRoomDto, relationDto, MessageDto } from './dto';
import * as bcrypt from 'bcrypt';
import { CurrentUserDto } from 'src/auth/dto';
import { UserService } from 'src/user/user.service';
import { last, throwError } from 'rxjs';
import { roomAdmin } from 'src/common/guards/roomAdmin.guard';


@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService){}

  hashData(data:string): Promise<string>{
    return bcrypt.hash(data, 10);
  }

  // Creare a chat room
  async createRoom(dto: createRoomDto, file: Express.Multer.File){
      
    try{
      let icon : string = "group.png";
      if (file && file.path)
      {
        icon = file.path.split('/')
          .filter(Boolean) 
          .slice(1)
          .join('.');
      }
      if (dto.type == ChatroomType.Protected)
      {
        if (!dto.password)
          throw new HttpException('Password needed', 409);
        dto.password = await this.hashData(dto.password);
      }
      const room = await this.prisma.chatRoom.create({
        data: {
          name: dto.name,
          type: dto.type,
          password: dto.password,
          icon: icon,
          members:{
            create:{
              role: RoomMemberRole.Owner,
              memberId: dto.ownerId
            }
          }
        }
      })
      let room_count = await this.prisma.roomMember.findMany({
        where:{
          memberId: dto.ownerId,
          role: RoomMemberRole.Owner
        }
      })
      let achievement = null;

      if (room_count.length == 5){
        let achieved = await this.prisma.achievements.findMany({
          where:{
            user_id: dto.ownerId,
            title: "it’s a kings world"
          }
        })
        if (!achieved.length)
        {
          achievement = {title: "it’s a kings world", desc: "Owner of 5 channels"}
          await this.prisma.achievements.create({
            data:{
              title:"it’s a kings world",
              desc:"Owner of 5 channels",
              user_id:dto.ownerId
            }
          })
        }
          
      }
      return achievement;
    } catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException('Room name already exist', 409);
        }
      }
      console.log(e);
    }
  }

  async updateRoom(dto: createRoomDto, room_id:number, file: Express.Multer.File){
      
    try{
      let icon : string = "/group.png";
      if (file && file.path)
      {
        icon = file.path.split('/')
          .filter(Boolean) 
          .slice(1)
          .join('.');
      }
      if (dto.type == ChatroomType.Protected)
      {
        if (!dto.password)
          throw new HttpException('Password needed', 409);
        dto.password = await this.hashData(dto.password);
      }
      const room = await this.prisma.chatRoom.update({
        where:{
          id: room_id
        },
        data: {
          name: dto.name || undefined,
          type: dto.type || undefined,
          password: dto.password || undefined,
          icon: icon || undefined,
        }
      })
      return {message: "success"};
    } catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException('Room name already exist', 409);
        }
      }
      console.log(e);
    }
  }

  // Add user to channel
  async addUserToChannel(dto: UserRoomDto){
    try{
      const role : RoomMemberRole = (dto.role) ? dto.role : RoomMemberRole.Member;
      const added = await this.prisma.roomMember.create({
        data:{
          role: role,
          roomId: dto.room_id,
          memberId: dto.user_id
        }
      })
      return added;
    } catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003') {
          throw new HttpException('This room or user does not exist', 409);
        }
        if (e.code === 'P2002') {
          throw new HttpException('Member already exist in room', 409);
        }
      }
    }
  }

  // Remove User from Channel
  async removeUserFromChannel(dto: UserRoomDto){
    try{
      const removed = await this.prisma.roomMember.delete({
        where:{
          roomId_memberId :{
            roomId : dto.room_id,
            memberId: dto.user_id
          }
        }
      })
      return removed;
    } catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new HttpException('This record does not exist', 409);
        }
      }
    }
  }

  //Mute group member
  async muteMember(dto: UserRoomDto){
    try{
      let min: number ;
      if (!dto.date_unmute)
        min = null;
      else {
        const now : any = new Date();
        const bannedUntil :any = new Date(dto.date_unmute);
        const difftime :any = bannedUntil - now;
        min = Math.floor((difftime / 1000) / 60);
      }
      const member = await this.prisma.roomMember.update({
        where:{
          roomId_memberId :{
            roomId : dto.room_id,
            memberId: dto.user_id
          }
        },
        data: {
          isBanned: true,
          bannedAt: new Date(Date.now()),
          banDuration: min
        }
      });
      return member;
    }catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new HttpException('This record does not exist', 409);
        }
      }
    }
  }

  // Get All channels
  async getAllchannels(user_id: number){
    try{
      let ret = [];
      let In : boolean;
      let channels = await this.prisma.chatRoom.findMany({
        where:{
          NOT:{
            type: ChatroomType.DirectMessage,
          },
          AND:{
            NOT:{
              type: ChatroomType.Private
            }
          },
        },
        include:{
          members:{
            include:{
              member:{
                
              }
            }
          }
        }
      });
      await Promise.all(channels.map(async (channel) => {
        delete channel.password;
        channel.members.forEach(member => {
          delete member.member.hashRt
        })
        let user = await this.prisma.roomMember.findUnique({
          where:{
            roomId_memberId: {
              roomId : channel.id,
              memberId: user_id
            }
          }
        })
        if (user !== null)
          channel["In"] = true;
        else
          channel["In"] = false;
        
      }))
      return channels;

    } catch(e){
      console.log(e);
    }
  }

  // Get User's group channels
  async getGroupChannels(user: CurrentUserDto){
    try{
      const channels = await this.prisma.chatRoom.findMany({
        where: {
          NOT:{
            type: ChatroomType.DirectMessage,
          },
          members: {
            some: {
              memberId: user.id,
              NOT:{
                isBanned:true,
                banDuration: null
              }
            },
          },
        },
        include:{
          members:{
            include:{
              member:{}
            }
          },
        },
        orderBy:{
          updatedAt: "desc"
        }
      })
      channels.map((channel) => {
        delete channel.password;
        channel.members.map((member) => {
            if(member && member.member){
              delete member.member.hashRt
              delete member.member.Socket_id;
              if (!member.member.avatar.includes("cdn"))
                member.member["avatar"] = process.env.BACK_URL + member.member.avatar;
              if (member.member.id == user.id)
              {
                channel["role"] = member.role;
                channel["In"] = true;
              }
            }
            return member;
        })
        return channel;
      })
      return channels;
    } catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003') {
          throw new HttpException('This user does not exist', 409);
        }
      }
    }
  }

  // Get direct message channels
  async getDirectMessages(dto: CurrentUserDto){
     try{
      const channels = await this.prisma.chatRoom.findMany({
        where:{
          type: ChatroomType.DirectMessage,
          members: {
            some:{
              memberId: dto.id
            }
          }
        },
        include:{
          members:{
            where:{
              NOT:{
                memberId: dto.id
              }
            },
            include:{
              member:true
            }
          }
        },
        orderBy:{
          updatedAt: "desc"
        }
      });

      let res = [];
      await Promise.all(channels.map(async channel => {
        delete channel.password;
        delete channel.name;
        delete channel.disabled;
        delete channel.icon;
        if (channel.members[0]){
          let blocked = await this.IsBlock(channel.members[0].member.id, dto.id);
          channel.members[0].member["IsBlocked"] = blocked;
          channel["disabled"] = false;
            delete channel.members[0].member.hashRt;
            delete channel.members[0].member.Socket_id;
            if (!channel.members[0].member.avatar.includes("cdn"))
              channel.members[0].member["avatar"] = process.env.BACK_URL + channel.members[0].member.avatar;
            channel["room_id"] = channel.id;
            channel["member"] = channel.members[0].member;
            res.push({
               room_id: channel.id,
               member: channel.members[0].member
            })
            delete channel.members;
        } else {
          channel["disabled"] = true;
        }
        return channel;
      }))
      res = channels.filter(channel => {return !channel.disabled})
      return res;

     }catch(e){
      console.log(e);
     }
  }

  // create message
  async createMessage(user_id: number, dto: MessageDto){
    try{
      const created = await this.prisma.chatRoom.update({
        where:{
          id: dto.room_id
        },
        data:{
          updatedAt: new Date(),
          messages:{
            create:{
              content: dto.content,
              from: user_id
            }
          }
        },
        include:{
          messages:{
            orderBy: {
              sentDate: 'desc',
            },
            take: 1,
          }
        }
      });
      let ret =[];
      let user = await this.prisma.user.findUnique({
        where:{
          id: user_id
        }
      });
      delete user.hashRt;
      delete user.status;
      delete user.Socket_id;
      if (!user.avatar.includes("cdn"))
        user["avatar"] = process.env.BACK_URL + user.avatar;
      let isMe = false;
      ret.push({
        text: created.messages[0].content,
        date: created.messages[0].sentDate,
        me: isMe,
        user: user
      })
      return ret;

    }catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003') {
          throw new HttpException('This room does not exist', 409);
        }
      }
      console.log(e);
    }
  }

  // get room message
  async getChannelMessages(user_id:number, room_id: number){
    try{
      let message = await this.prisma.message.findMany({
        where:{
          roomId: room_id
        },
      })
      let ret = [];
      await Promise.all(message.map(async (element) => {
        let user = await this.prisma.user.findUnique({
          where:{
            id: element.from
          }
        });
        let relation :any;
        if (user){
          relation = await this.prisma.userRelation.findMany({
            where:{
              OR:[
                {
                  requesterId: user_id,
                  addressedId: user.id
                },
                {
                  addressedId: user_id,
                  requesterId: user.id,
                }
              ],
              AND:{
                status: RelationStatus.Blocked
              }
            }
          })
        }
        if (user && !relation.length)
        {
          delete user.hashRt;
          delete user.status;
          if (!user.avatar.includes("cdn"))
            user["avatar"] = process.env.BACK_URL + user.avatar;
          ret.push({
            text: element.content,
            date: element.sentDate,
            user: user
          })
        }
      }));
      ret.sort((a,b) => a.date - b.date);
      return ret;

    } catch(e){
      console.log(e);
    }
  }

  // Isbanned
  async IsBanned(user_id:number, room_id: number){
    try{
      let member = await this.prisma.roomMember.findMany({
        where:{
          memberId: user_id,
          roomId: room_id
        }
      })
      if (member.length && member[0].isBanned){
        const now : any = new Date();
        const bannedAt :any = new Date(member[0].bannedAt);
        const difftime :any = now -  bannedAt;
        const min = Math.floor((difftime / 1000) / 60);
        if (min < member[0].banDuration)
          return {banned: true, duration: member[0].banDuration - min};
        else
        {
          let member = await this.prisma.roomMember.updateMany({
            where:{
                memberId: user_id,
                roomId: room_id
            },
            data:{
                isBanned: false,
                bannedAt: null,
                banDuration: 0
            }
          })
        }
      }else if (!member.length)
        return {banned :true, duration: null};
      return {banned :false, duration: 0};
    }catch(e){
      console.log(e);
    }
  }

  //join room
  async joinRoom(user_id: number, room_id: number, password: string){
      try{
         if (password)
         {
            let room = await this.prisma.chatRoom.findUnique({
              where:{
                id: room_id
              }
            })
            if (!room)
              throw new HttpException("this room does not exist", 409);
            const isMatch = await bcrypt.compare(password, room.password);
            if (room.type === "Private" || !isMatch)
              throw new ForbiddenException("Access Denied");
         }
         let member = await this.prisma.roomMember.create({
          data:{
            roomId: room_id,
            memberId: user_id,
            role: RoomMemberRole.Member
          }
         })
         return member
      } catch(e){
        throw(e);
      }
  }

  //leave room
  async leaveRoom(user_id: number, room_id: number){
    try{

       let member = await this.prisma.roomMember.delete({
        where:{
          roomId_memberId:{
            roomId: room_id,
            memberId: user_id
          }
        }
       })
       return {message: "left room"}   
    } catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new HttpException('This record does not exist', 409);
        }
      }
    }
}
  // get group members
  async getGroupMembers(user_id: number, room_id: number){
    try{
      let members = await this.prisma.roomMember.findMany({
        where:{
          NOT:{
            memberId: user_id,
          },
          roomId : room_id
        },
        include:{
          member:{}
        }
      })
      let ret = [];

      members.map((member) => {
        if (!member.isBanned || (member.isBanned && member.banDuration != null))
        {
          let date = new Date();
          date.setUTCMinutes(date.getMinutes() + member.banDuration);
          let avatar : string = member.member.avatar.includes("cdn") ? member.member.avatar : process.env.BACK_URL + member.member.avatar; 
          ret.push({
            role: member.role,
            id: member.member.id,
            username: member.member.username,
            avatar: avatar,
            IsMuted: member.isBanned,
            muteDate :date
        })
        }
        return member;
      })
      return ret;
    } catch(e){
      throw new HttpException("Error", 409);
    }
  }

  // get banned Members
  async getBannedMembers(room_id: number){
    try{
      let members = await this.prisma.roomMember.findMany({
        where:{
          roomId: room_id,
          isBanned: true,
          banDuration: null,
        },
        include:{
          member:{}
        }
      })
      let ret = [];

      members.forEach((member) => {
          let date = new Date();
          date.setUTCMinutes(date.getMinutes() + member.banDuration);
          let avatar : string = member.member.avatar.includes("cdn") ? member.member.avatar : process.env.BACK_URL + member.member.avatar; 
          ret.push({
            role: member.role,
            id: member.member.id,
            username: member.member.username,
            avatar: avatar,
            IsMuted: member.isBanned,
            muteDate :member.banDuration
        })
      })
      //console.log(ret);
      return ret;
    }catch(e){

    }
  }
  // get users not in a group
  async getUsersNotInGroup(user_id: number, room_id: number){
    try{
      let users = await this.prisma.user.findMany({
        where:{
            members:{
              every:{
                NOT:{
                  OR:[
                    {roomId: room_id},
                    {
                      roomId: room_id,
                      isBanned: true,
                      banDuration: null
                    }
                  ]
                }
              } 
            }
        },
      })
      users.map((user) => {
        if (!user.avatar.includes("cdn"))
          user["avatar"] = process.env.BACK_URL + user.avatar;
      })
      return users;

    }catch(e){
      console.log(e);
    }
  }

  // change member role
  async ChangeMemberRole(user_id: number, to_update: number, room_id:number, role: RoomMemberRole){
    try{
      let updated = await this.prisma.roomMember.updateMany({
        where:{
          NOT:{
            role: RoomMemberRole.Owner
          },
          roomId: room_id,
          memberId: to_update
        },
        data:{
          role: role
        }
      })

      return updated;
    }catch(e){
      console.log(e);
    }
  }

  //Get cahnnel Info
  async getChannelInfo(room_id: number){
    try{
      let channel = await this.prisma.chatRoom.findUnique({
        where:{
          id: room_id
        }
      })
      return channel;
    }catch(e){

    }
  }

  //bunban member
  async unbanMember(user_id:number, room_id:number){
    try{
      let member = await this.prisma.roomMember.update({
        where:{
          roomId_memberId:{
            roomId: room_id,
            memberId: user_id
          }
        },
        data:{
          isBanned: false,
          bannedAt: null,
        }
      })
      return member;
    }catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new HttpException('This record does not exist', 409);
        }
      }
      console.log(e);
    }
  }

  //Delete room
  async deleteChannel(room_id: number, user_id:number, password?: string){
    try{
      let room = await this.prisma.chatRoom.findUnique({
        where:{
          id: room_id
        },
        include:{
          members:{
            where:{
              role: RoomMemberRole.Owner
            }
          }
        }
      });
      if (room.members[0].memberId != user_id)
        throw new ForbiddenException();
      if (room && room.type === ChatroomType.Protected){
        const isMatch = await bcrypt.compare(password, room.password);
        if (!isMatch)
          throw new ForbiddenException();
      }
      let deleted = await this.prisma.chatRoom.delete({
        where:{
          id: room_id
        }
      })
      return {message: "succedss"}
    }catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new HttpException('This record does not exist', 409);
        }
      }
      throw(e);
    }
  }

  // IsBlocked
  async IsBlock(current_id: number, user_id: number){
    try{
      let relation = await this.prisma.userRelation.findMany({
        where:{
          OR:[
            {
              requesterId: current_id,
              addressedId: user_id,
            },
            {
              requesterId: user_id,
              addressedId: current_id,
            }
          ],
          AND:{
            status: RelationStatus.Blocked
          }
        }
      });
      if (relation.length)
        return true;
      return false;
    }catch(e){}
  }

  //get Active group members
  async getActivemembers(current_id: number, room_id: number){
    try{
      let members = await this.prisma.roomMember.findMany({
        where:{
          roomId:room_id,
          NOT:{
            memberId: current_id,
          },
          AND:{
            NOT:{
              isBanned:true,
              banDuration:null
            }
          }
        }
      })
      return members;
    }catch(e){}
  }

  async roomAdmin(current_id:number, room_id: number, user_id?: number){
    try{
      const member = await this.prisma.roomMember.findUnique({
        where:{
            roomId_memberId:{
                roomId: room_id,
                memberId: current_id
            }
        }
    });
    if (!member)
      return false;
    if (member.role === RoomMemberRole.Admin ||
        member.role === RoomMemberRole.Owner)
       {
          if(user_id)
          {
            let member = await this.prisma.roomMember.findUnique({
              where:{
                roomId_memberId:{
                  roomId: room_id,
                  memberId: user_id
                }
              },
            })
            if (member && member.role === RoomMemberRole.Owner)
              return false;
          }
          return true;
       }
       return false;
    }catch(e){}
  }
}
