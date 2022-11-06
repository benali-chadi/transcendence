import { CanActivate, ExecutionContext, Injectable, ParseIntPipe } from "@nestjs/common";
import { RoomMemberRole } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class roomAdmin implements CanActivate{
    constructor(private prisma: PrismaService){}

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
      
      let request = context.switchToHttp().getRequest();
      const user = request.user;
      const body = request.body;
      let room_id:number;
      if (body.room_id === undefined)
        room_id = parseInt(request.params.room_id)
      else
        room_id = body.room_id;
      const member = await this.prisma.roomMember.findUnique({
          where:{
              roomId_memberId:{
                  roomId: room_id,
                  memberId: user.id
              }
          }
      });
      if (!member)
        return false;
      if (member.role === RoomMemberRole.Admin ||
          member.role === RoomMemberRole.Owner)
         {
            if(request.body.user_id)
            {
              let member = await this.prisma.roomMember.findUnique({
                where:{
                  roomId_memberId:{
                    roomId: room_id,
                    memberId: request.body.user_id
                  }
                },
              })
              if (member && member.role === RoomMemberRole.Owner)
                return false;
            }
            return true;
         }
      return false;
    }
}