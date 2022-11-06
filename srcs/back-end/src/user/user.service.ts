import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { ChatroomType, Prisma, RelationStatus, RoomMemberRole } from '@prisma/client';

import { CurrentUserDto } from 'src/auth/dto';
import { relationDto, UserRoomDto } from 'src/chat/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}

    async getMe(user_id:number){
        try{
            const user = await this.prisma.user.findUnique({
                where:{
                    id: user_id
                },
                select:{
                  avatar:true,
                  username:true,
                  level:true,
                  id:true
                }
            });
            if (!user)
              throw new ForbiddenException();
            if (!user.avatar.includes("cdn"))
              user.avatar = process.env.BACK_URL + user.avatar;
            user["_level"] =  parseFloat( user.level.toString());
            return user;
        }catch(e){
          throw new ForbiddenException();
        }
    }

    async getUserIdbyname(username :string){
      
      try{
        let user = await this.prisma.user.findUnique({
          where:{
          username: username
        }
        });
        if (!user)
          return null;
        return user.id;
      }catch(e){
        console.log(e);
      }
    }

    async getUserByUsername(current_id: number, username: string){
        try{
            const id = await this.getUserIdbyname(username);
            if (!id)
              throw new HttpException("this user does not exist", 409);
            const user = await this.prisma.user.findUnique({
                where:{
                    username: username
                },
                include:{
                    requested:{
                        where:{
                            requesterId: id,
                            addressedId: current_id
                        }
                    },
                    addressed:{
                        where:{
                            addressedId: id,
                            requesterId: current_id
                        }
                    }
                }
            });
            let relation: string = null;
            let blocked: boolean = false;
            let blocker: boolean = false;
            if (user.addressed.length == 0 && user.requested.length == 0)
                relation = "none";
            if ((user.addressed[0] && user.addressed[0].status == "Accepted") ||
            (user.requested[0] && user.requested[0].status == "Accepted"))
                relation = "friends";
            if ((user.addressed[0] && user.addressed[0].requesterId === current_id && user.addressed[0].status == "Blocked") ||
                (user.requested[0] && user.requested[0].requesterId === current_id && user.requested[0].status == "Blocked"))
                blocked = true;
            if ((user.addressed[0] && user.addressed[0].addressedId === current_id && user.addressed[0].status == "Blocked") ||
              (user.requested[0] && user.requested[0].addressedId === current_id && user.requested[0].status == "Blocked"))
                blocker = true;
            if (user.requested[0] && user.requested[0].status == "Requested")
                relation = "Accept invitation";
            if (user.addressed[0] && user.addressed[0].status == "Requested")
                relation = "Invitation Sent";
            user["blocked"] = blocked;
            user["blocker"] = blocker;
            user["IsBlocked"] = blocked || blocker;
            user["relation"] = relation;
            user["type"] = "DM";
            
            user["_level"] =  parseFloat( user.level.toString());
            if (!user.avatar.includes("cdn"))
              user["avatar"] = process.env.BACK_URL + user.avatar;
            delete user.hashRt;
            return user;
        }catch(e){
          throw(e);
        }
    }

    async getUserById(current_id: number, id: number){
      try{
          const user = await this.prisma.user.findUnique({
              where:{
                id: id
              },
              include:{
                  requested:{
                      where:{
                          requesterId: id,
                          addressedId: current_id
                      }
                  },
                  addressed:{
                      where:{
                          addressedId: id,
                          requesterId: current_id
                      }
                  }
              }
          });
          let relation: string = null;
          let blocked: boolean = false;
          if (user.addressed.length == 0 && user.requested.length == 0)
              relation = "none";
          if ((user.addressed[0] && user.addressed[0].status == "Accepted") ||
          (user.requested[0] && user.requested[0].status == "Accepted"))
              relation = "friends";
          if ((user.addressed[0] && user.addressed[0].status == "Blocked") ||
              (user.requested[0] && user.requested[0].status == "Blocked"))
              blocked = true;
          if (user.requested[0] && user.requested[0].status == "Requested")
              relation = "Accept invitation";
          if (user.addressed[0] && user.addressed[0].status == "Requested")
              relation = "Invitation Sent";
          user["blocked"] = blocked;
          user["relation"] = relation;
          if (!user.avatar.includes("cdn"))
            user["avatar"] = process.env.BACK_URL + user.avatar;
          delete user.hashRt;
          return user;
      }catch(e){
          console.log(e);
      }
  }

    async getAllUsers(user_id: number){
        try{
            const users = await this.prisma.user.findMany({
                where:{
                    NOT:{
                        id: user_id
                    }
                },
                include:{
                    addressed:{
                        where:{
                            OR:[
                                {requesterId: user_id},
                                {addressedId: user_id}
                            ]
                        }
                    },
                    requested:{
                        where:{
                            OR:[
                                {requesterId: user_id},
                                {addressedId: user_id}
                            ]
                        }
                    }
                }
            });
            let ret = [];
            users.map(user => {
                delete user.hashRt;
                delete user.Socket_id;
                if (!user.avatar.includes("cdn"))
                  user["avatar"] = process.env.BACK_URL + user.avatar;
                if ((user.addressed[0] && user.addressed[0].requesterId === user_id && user.addressed[0].status == "Blocked") ||
                (user.requested[0] && user.requested[0].requesterId === user_id && user.requested[0].status == "Blocked"))
                    user["blocked"] = true;   
                else
                    user["blocked"] = false;
                if ((user.addressed[0] && (user.addressed[0].requesterId === user_id || user.addressed[0].addressedId === user_id) 
                  && user.addressed[0].status == "Accepted") ||
                    (user.requested[0] && (user.requested[0].requesterId === user_id || user.requested[0].addressedId === user_id)
                    && user.requested[0].status == "Accepted"))
                    user["Isfriend"] = true;   
                else
                    user["Isfriend"] = false;
                ret.push(user);
            })
            //console.log(ret);
            return ret;
            //return users;
        } catch(e){
            console.log(e);
        }
    }

    async updateProfile(user_id: number, username:string, file: Express.Multer.File){
        try{
            let avatar : string = null;
            if (file && file.path)
            {
                avatar = file.path.split('/')
                .filter(Boolean)
                .slice(1)
                .join('.');
            }
            const updated = await this.prisma.user.update({
                where:{
                    id: user_id
                },
                data:{
                    username: username,
                    avatar: avatar != null ? avatar : undefined,
                }
            })
            delete updated.hashRt;
            delete updated.Socket_id;

            if (!updated.avatar.includes("cdn"))
              updated["avatar"] = process.env.BACK_URL + updated.avatar;
            updated["firsr_time"] = false;
            return updated;
        }catch(e){
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                  throw new HttpException('this username already exist', 409);
                }
              }
        }
    }

      // Block User
    async blockUser(user_id: number, toBlock: number){
    try{
      const relation = await this.prisma.userRelation.findMany({
        where:{
          OR:[
            {
              requesterId: user_id,
              addressedId: toBlock
            },
            {
              requesterId: toBlock,
              addressedId: user_id
            }
          ]
        }
      });
      let room_name: string;
      if (relation[0])
        room_name = this.getRoomName(relation[0].requesterId, relation[0].addressedId);
      else
        room_name = this.getRoomName(user_id, toBlock);
      const updatedRoom = await this.prisma.chatRoom.updateMany({
        where:{
          name: room_name
        },
        data:{
          disabled: true
        }
      })
      let requested :number = 0;
      let addressed :number = 0;
      if (relation[0])
      {
        requested = relation[0].requesterId;
        addressed = relation[0].addressedId;
      }
      const updatedRelation = await this.prisma.userRelation.upsert({
        where:{
          requesterId_addressedId:{
            requesterId: requested || user_id,
            addressedId: addressed || toBlock
          }
        },
        update:{
          requesterId: user_id,
          addressedId: toBlock,
          status: RelationStatus.Blocked
        },
        create:{
          requesterId: user_id,
          addressedId: toBlock,
          status: RelationStatus.Blocked,
          name: user_id.toString() + toBlock.toString()
        }
      });

      return await this.getUserById(user_id, toBlock);
      
    }catch(e){
      console.log(e);
    }
  }
  
  // get room name
  getRoomName(id_1: number, id_2:number){
    return (id_1 < id_2) ?
    id_1.toString() + id_2.toString():
    id_2.toString() + id_1.toString()
  }

  //unblockUser
  async unblockUser(user_id: number, toUnblock: number){
    try{
      const relation = await this.prisma.userRelation.delete({
        where:{
          requesterId_addressedId:{
            requesterId: user_id,
            addressedId: toUnblock
          }
        },
      });
      const updatedRoom = await this.prisma.chatRoom.updateMany({
        where:{
          name: this.getRoomName(user_id, toUnblock)
        },
        data:{
          disabled: false
        }
      })
      return await this.getUserById(user_id, toUnblock);
    }catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new HttpException('This record does not exist', 409);
        }
      }
      console.log(e);
    }
  }

    // Senf friend request
  async sendFriendRequest(user_id: number, dto: relationDto){
    try{
      if (user_id == dto.addressed_id){
        throw new HttpException('Same user id', 409);
      }
      const found = await this.prisma.userRelation.findUnique({
        where:{
          requesterId_addressedId:{
            addressedId: user_id,
            requesterId: dto.addressed_id,
          }
        }
      });
      if(found){
        throw new HttpException('Relation already exist between users', 409)
      }
      const relation = await this.prisma.userRelation.create({
        data:{
          status: dto.status,
          addressedId: dto.addressed_id,
          requesterId: user_id,
          name: user_id.toString() + dto.addressed_id.toString(),
        }
      });
      return await this.getUserById(user_id, dto.addressed_id);

    } catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003') {
          throw new HttpException('This user does not exist', 409);
        }
        if (e.code === 'P2002') {
          throw new HttpException('Relation already exist between users', 409);
        }
      }
      throw e;
    }
  }

  // Accept friend request
  async acceptFriendReq(user_id: number, requester_id: number){
    try{
      const relation = await this.prisma.userRelation.update({
        where:{
          requesterId_addressedId:{
            requesterId: requester_id,
            addressedId: user_id
          }
        },
        data:{
          status: RelationStatus.Accepted
        }
      })

      if (relation){
        const room_name = (user_id < requester_id) ?
        user_id.toString() + requester_id.toString() :
        requester_id.toString() + user_id.toString();
        const room = await this.prisma.chatRoom.upsert({
        where:{
            name: room_name
        },
        update:{
            disabled: true,
        },
        create: {
            type: ChatroomType.DirectMessage,
            name: room_name,
            members:{
              create:[
                {
                  role: RoomMemberRole.Member,
                  memberId: requester_id
                },
                {
                  role: RoomMemberRole.Member,
                  memberId: user_id
                }
            ]}
          }
        })
      }
      return await this.getUserById(user_id, requester_id);

    } catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new HttpException('This record does not exist', 409);
        }
      }
      console.log(e);
    }
  }
  //Decline invitation
  async declineFriendReq(user_id: number, requester_id: number){
    try{
      const relation = await this.prisma.userRelation.delete({
        where:{
          requesterId_addressedId:{
            requesterId: requester_id,
            addressedId: user_id,
          }
        }
      })
      return await this.getUserById(user_id, requester_id);

    }catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new HttpException('This record does not exist', 409);
        }
      }
    }
  }

  //  Delete friend
 async deleteFriend(user_id: number, requester_id: number){
    try{
        const found = await this.prisma.userRelation.findMany({
          where:{
            OR:[
              {
                requesterId: requester_id,
                addressedId: user_id
              },
              {
                requesterId: user_id,
                addressedId: requester_id
              }
            ]
          }
        });
        const relation = await this.prisma.userRelation.deleteMany({
        where:{
            OR:[
                {
                    requesterId: requester_id,
                    addressedId: user_id
                },
                {
                    requesterId: user_id,
                    addressedId: requester_id
                }
            ]
        },
      })
      if(found)
      {
        const room_name = (user_id < requester_id) ?
        user_id.toString() + requester_id.toString() :
        requester_id.toString() + user_id.toString();
        const deletedRoom = await this.prisma.chatRoom.updateMany({
            where:{
              name:room_name
            },
            data:{
                disabled: true
            }
          })
      }
      
      return await this.getUserById(user_id, requester_id);

    } catch(e){
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new HttpException('This record does not exist', 409);
        }
      }
      console.log(e);
    }
  }

  // Get Friends
  async getFriends(current_id: number, username: string){
    try{
      const user_id = await this.getUserIdbyname(username);
      if (!user_id)
          throw new HttpException("this user does not exist", 409);
      const friends = await this.prisma.userRelation.findMany({
        include: {
          r_user: true,
          a_user: true
        },
        where:{
          OR:[
            {requesterId: user_id},
            {addressedId: user_id},
          ],
          AND:{status: RelationStatus.Accepted},
        },
      });
      
      let users = [];
      
      friends.forEach(friend => {
        let to_add : any = {};
        delete friend.a_user.hashRt;
        delete friend.r_user.hashRt;
        if (user_id != friend.a_user.id)
          to_add = friend.a_user;
        else if (user_id != friend.r_user.id)
          to_add = friend.r_user;
        if (to_add.id !== current_id)
          users.push(to_add);
      });
      return users;

    } catch(e){
        throw(e);
    }
  }

  // Get friend requests
  async getFriendReqs(user_id: number){
    try{
      const requests = await this.prisma.userRelation.findMany({
        where:{
          addressedId: user_id,
          status: RelationStatus.Requested
        },
        include:{
          r_user: true
        }
      })
      requests.forEach(req => {
        delete req.r_user.hashRt;
      })
      return requests;
    } catch(e){
      console.log(e);
    }
  }

  // Update Status
  async UpdateStatus(id:number, status: string, socket_id: string){
    try{
      if (status == "online")
      {
        let updated = await this.prisma.user.update({
          where:{
            id: id
          },
          data:{
            status: status,
            Socket_id: socket_id
          }
        })
      } else {
        let user = await this.prisma.user.findUnique({
          where:{
            Socket_id: socket_id
          }
        })
        if (user)
        {
          let updated = await this.prisma.user.update({
            where:{
              Socket_id: socket_id
            },
            data:{
              status: status,
              Socket_id: null
            }
          })
        }
      }
    }catch(e){
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
      console.log(relation);
      if (relation.length)
        return true;
      return false;
    }catch(e){}
  }

  //get Friend Count
  async frindCount(current_id: number, user_id:number){
    try{
      let first: boolean = false;
      let second: boolean = false;

      let current_count = await this.prisma.userRelation.findMany({
        where:{
          OR:[
            {requesterId: current_id},
            {addressedId: current_id}
          ],
          AND:{
            status: RelationStatus.Accepted
          }
        }
      });
      if (current_count.length == 5)
      {
        let achievements = await this.prisma.achievements.findMany({
          where:{
            user_id: current_id,
            title: "Social animal"
          }
        })
        if (!achievements.length)
        {
          first = true;
          await this.prisma.achievements.create({
            data:{
              title:"Social animal",
              desc:"You made 5 friends",
              user_id:current_id
            }
          })
        }
      }
      let user_count = await this.prisma.userRelation.findMany({
        where:{
          OR:[
            {requesterId: user_id},
            {addressedId: user_id}
          ],
          AND:{
            status: RelationStatus.Accepted
          }
        }
      });
      if (user_count.length == 5)
      {
        let achievements = await this.prisma.achievements.findMany({
          where:{
            user_id: user_id,
            title: "Social animal"
          }
        })
        if (!achievements.length)
        {
          second = true;
          await this.prisma.achievements.create({
            data:{
              title:"Social animal",
              desc:"You made 5 friends",
              user_id:user_id
            }
          })
        }  
      }
      return {first: first, second: second, 
        achievements: {title: "Social animal", desc: "You made 5 friends",}}
    }catch(e){}
  }

  async getAchievements(current_id: number, username: string){
    try{
      let achievements = null;
      let user = await this.getUserByUsername(current_id, username);
      if (user){
         achievements = await this.prisma.achievements.findMany({
          where:{
            user_id: user.id
          }
        })
      }
      return achievements;
    }catch(e){}
  }
}
