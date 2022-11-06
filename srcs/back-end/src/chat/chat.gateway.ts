import { ForbiddenException, Logger, UseGuards } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, WsException } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CurrentUserDto } from 'src/auth/dto';
import { CurrentUser } from 'src/common/decorators';
import { roomAdmin } from 'src/common/guards/roomAdmin.guard';
import { WsGuard } from 'src/common/guards/ws.guard';
import { ChatService } from './chat.service';
import { UserRoomDto } from './dto';

@UseGuards(WsGuard)
@WebSocketGateway({ cors: {origin: process.env.FRONT_URL, credentials : true,}, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('ChatGateway');
  Rooms: any[] = [];
  Users: any[] = [];

  afterInit(server: any) {
    this.logger.log('Initialized!');
  }

  async handleConnection( client: Socket, ...args: any[]) {
    let user: any = client.handshake.query.user;
    if (user)
        user = JSON.parse(user.toString());
    if (user)
    {      
        this.Users.push({
          username: user.username,
          id: user.id,
          socket: client
        })
    }
    await Promise.all(this.Users.map(  async _user => {
      if (user)
      {
        if (user.username !== _user.username){
          
          let Isblock = await this.chatService.IsBlock(user.id, _user.id);
          if (Isblock){
          this.Rooms.push(`${_user.username}blocked`);
          this.Rooms.push(`${user.username}blocked`);
          client.join(`${_user.username}blocked`);
          _user.socket.join(`${user.username}blocked`);
        }}
        }
        
    }))

  }

  async handleDisconnect(client: Socket) {
      //console.log(client.id +  "    DisConnected ")
      this.Users.filter(async user => {
        if (user.socket && user.socket.id !== client.id)
        {
          return user;
        } else {
          await Promise.all(this.Users.map(async _user => {
            if (user)
            {
              let Isblock = await this.chatService.IsBlock(user.id, _user.id);
              if (Isblock){
                client.leave(`${_user.username}blocked`);
                _user.socket.leave(`${user.username}blocked`);
              }}
          }))
        }
        
      })
  }
  
  async sendNotifications(current_id: number, username: string, room_id: number){
    const members = await this.chatService.getActivemembers(current_id, room_id);
    members.forEach(member =>{
      this.Users.forEach(user => {
        if (user.id === member.memberId){
          this.server.to(user.socket.id).except(`${username}blocked`).except(room_id.toString()).emit('chat_notif', {room_id: room_id});
        }
      })
    }) 
  }

  @SubscribeMessage('chatToServer')
  async handleMessage(@ConnectedSocket() client: Socket, @CurrentUser() user: CurrentUserDto, @MessageBody() message: { room_id: number, content: string }) {
    
    //console.log("------>" + user.username + " sent  " + message.room_id);
    const Isbanned = await this.chatService.IsBanned(user.id, message.room_id);
    if (Isbanned.banned && Isbanned.duration !== null)
    {
      return {message: `you're banned from this room for ${Isbanned.duration}`}
    }
    else if (Isbanned.banned)
      return {message: `you're kicked from this room for`}

    const msg = await this.chatService.createMessage(user.id, message);
    this.server.to(message.room_id.toString()).except(`${user.username}blocked`).emit('chatToClient', {msg, room_id: message.room_id});
    client.broadcast.except(`${user.username}blocked`).emit('updateRooms');
    await this.sendNotifications(user.id, user.username, message.room_id);
    return ;
  }

  @SubscribeMessage('joinRoom')
  async handleRoomJoin(@ConnectedSocket() client: Socket, @CurrentUser() user: CurrentUserDto, @MessageBody() room_id: number) {
    if (room_id > 0)
    {
      //console.log("------>" + user.username + " joined room " + room_id.toString());
      client.join(room_id.toString());
      await Promise.all(this.Users.map(  async _user => {
          let Isblock = await this.chatService.IsBlock(user.id, _user.id);
          if (Isblock){
            this.Rooms.push(`${_user.username}blocked`);
            this.Rooms.push(`${user.username}blocked`);
            client.join(`${_user.username}blocked`);
            _user.socket.join(`${user.username}blocked`);
          }
      }))
      return await this.chatService.getChannelMessages(user.id, room_id);
    }
  }

  @SubscribeMessage('leaveRoom')
  handleRoomLeave(@ConnectedSocket() client: Socket, @MessageBody() room_id: number ) {
    if (room_id > 0)
    {
      //console.log("------> left room " + room_id.toString());
      this.Rooms.map(room => {
        if (room.includes("blocked"))
          client.leave(room);
      })
      client.leave(room_id.toString());
      //client.emit('leftRoom', room_id);
    }
  }

  @SubscribeMessage("joined room")
  async handleJoinedRoom(@ConnectedSocket() client: Socket, @CurrentUser() user, @MessageBody() message: {room_id: number, password: string}){
    try{
      await this.chatService.joinRoom(user.id, message.room_id, message.password);
      //const msg = await this.chatService.createMessage(0, {room_id: message.room_id, content: `${user.username} joined`});
      let msg = [];
      msg.push({text:`${user.username} joined`});
      this.server.to(message.room_id.toString()).emit('chatToClient', {msg, room_id: message.room_id});
    }
    catch(e){
      throw new WsException(e);
    }
  }
    @SubscribeMessage("left room")
    async handleLeftRoom(@ConnectedSocket() client: Socket, @CurrentUser() user, @MessageBody() message: {room_id: number, password: string}){
      try{
        await this.chatService.leaveRoom(user.id, message.room_id);
        //const msg = await this.chatService.createMessage(0, {room_id: message.room_id, content: `${user.username} left`});
        let msg = [];
        msg.push({text:`${user.username} left`});
        this.server.to(message.room_id.toString()).emit('chatToClient', {msg, room_id: message.room_id});
      }
      catch(e){
        throw new WsException(e);
      }
    }

    @SubscribeMessage("updateRoom")
    async handleUpdateRoom(@ConnectedSocket() client: Socket, @CurrentUser() user, @MessageBody() message : {todo: string, data: UserRoomDto}){
      try{
        let check: boolean =  await this.chatService.roomAdmin(user.id, message.data.room_id, message.data.user_id)
        if (!check)
          throw new ForbiddenException();
        let result: any = null;
        if (message.todo === "add_member"){
          result = await this.chatService.addUserToChannel(message.data)
        } else if (message.todo === "remove_member"){
          result = await this.chatService.removeUserFromChannel(message.data)
        } else if (message.todo === "mute_user"){
          result = await this.chatService.muteMember(message.data);
        } else if (message.todo === "unban"){
          result = await this.chatService.unbanMember(message.data.user_id, message.data.room_id);
        } else if (message.todo === "change_member_role"){
          result = await this.chatService.ChangeMemberRole(user.id, message.data.user_id, message.data.room_id, message.data.role)
        }
        // } else if (message.todo === "delete"){

        // }
        this.server.emit("updateRooms");
        return result;
      }catch(e){
        throw new WsException(e);
      }
    }
}
