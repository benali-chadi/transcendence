import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { RelationStatus } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { CurrentUserDto } from "src/auth/dto";
import { relationDto } from "src/chat/dto";
import { CurrentUser } from "src/common/decorators";
import { WsGuard } from "src/common/guards/ws.guard";
import { UserService } from "./user.service";

@UseGuards(WsGuard)
@WebSocketGateway({ cors: {origin: process.env.FRONT_URL, credentials : true,}, namespace: '/user' })
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly userService: UserService) {}

    @WebSocketServer() server: Server;

    async handleConnection(client: Socket, ...args: any[]) {
        
        try{
            let user: any = client.handshake.query.user;
            if (user)
                user = JSON.parse(user.toString());
            //console.log(client.id + "    Connected /user");
            if (user)
                await this.userService.UpdateStatus(user.id, "online", client.id)
            //console.log(user);
            client.broadcast.emit("client status"); 
        }
        catch(e){
            
        }
        
    }

    async handleDisconnect(client: Socket) {
        if (client.id)
            await this.userService.UpdateStatus(0, "offline", client.id);
        client.broadcast.emit("client status");
        //console.log(client.id +  "    DisConnected /user")
    }

    @SubscribeMessage("relation status")
    async sendInvitation(@ConnectedSocket() client: Socket, @CurrentUser() user: CurrentUserDto, @MessageBody() message: { id : number,  to_do: string}){
       try{
        const data: relationDto = {
            status: RelationStatus.Requested,
            addressed_id: message.id
        };
        let _user: any;
        let socket_id: string;
        if (message.to_do === "add_friend")
        {
            _user = await this.userService.sendFriendRequest(user.id, data);
            if (_user && _user.id)
            {
                const u = await this.userService.getUserById(user.id, message.id);
                socket_id = u.Socket_id;
            }
        } else if (message.to_do === "accept_friend")
        {
            _user = await this.userService.acceptFriendReq(user.id, message.id);
            if (_user && _user.id)
            {
                const u = await this.userService.getUserById(user.id, message.id);
                socket_id = u.Socket_id;
            }
        } else if (message.to_do === "unfriend"){
            _user = await this.userService.deleteFriend(user.id, message.id);
            if (_user && _user.id)
            {
                const u = await this.userService.getUserById(user.id, message.id);
                socket_id = u.Socket_id;
            }
        } else if (message.to_do === "block_user"){
            _user = await this.userService.blockUser(user.id, message.id);
            if (_user && _user.id)
            {
                const u = await this.userService.getUserById(user.id, message.id);
                socket_id = u.Socket_id;
            }
        } else if (message.to_do === "decline_req"){
            _user = await this.userService.declineFriendReq(user.id, message.id);
            if (_user && _user.id)
            {
                const u = await this.userService.getUserById(user.id, message.id);
                socket_id = u.Socket_id;
            }
        } else {
            _user = await this.userService.unblockUser(user.id, message.id);
            if (_user && _user.id)
            {
                const u = await this.userService.getUserById(user.id, message.id);
                socket_id = u.Socket_id;
            }
        }
        let msg = message.to_do === "add_friend" ? "friend req" : null;
        if (message.to_do === "block_user")
            msg = "blocked"
        const u = await this.userService.getUserById(message.id, user.id);
        this.server.to(socket_id).emit("relation status",{msg: msg, user: u});
        if(message.to_do !== "add_friend"){
            this.server.to(client.id).emit("relation status",{msg: msg, user: u});
        }
        
        if (message.to_do === "add_friend" || message.to_do === "accept_friend"){
            let {first, second, achievements} = await this.userService.frindCount(user.id, u.id);
            if (first)
                this.server.to(client.id).emit("Achievement",[{achievements}]);
            if (second)
                this.server.to(u.Socket_id).emit("Achievement",[{achievements}]);
        }
        return _user;

       } catch(e){
        throw new WsException(e);
       }
    }
}