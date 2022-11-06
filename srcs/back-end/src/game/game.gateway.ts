import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';
import { Socket, Server } from 'socket.io';
import { Game, GamePair, Player } from './dto';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from 'src/common/guards/ws.guard';
import { CurrentUser } from 'src/common/decorators';
import { CurrentUserDto } from 'src/auth/dto';

@UseGuards(WsGuard)
@WebSocketGateway({
  cors: { origin: process.env.FRONT_URL, credentials: true },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private prisma: PrismaService,
    private userSevice: UserService,
    private gameService: GameService,
  ) { }

  @WebSocketServer() server: Server;

  sockets: Map<string, string> = new Map<string, string>();
  players: Player[] = [];
  Games: Map<string, Game> = new Map<string, Game>();
  GamePairs: Map<string, GamePair> = new Map<string, GamePair>();

  handleConnection(client: Socket, ...args: any[]) {
    try {
      let user: any = client.handshake.query.user;
      if (user) user = JSON.parse(user.toString());
      if (user) this.sockets.set(user.username, client.id);
    } catch (e) {
    }
  }

  async handleDisconnect(client: any) {
    this.sockets.forEach(async (value, key) => {
      if (value === client.id) {
        this.removePlayerFromQueue(key);
        this.removePlayerGamePair(client, key);
		    this.sockets.delete(key);
        this.Games.forEach(async game => {
          if (game.IsPlayer(key))
          {
            game.stopGame();
            let winner =
              game.player1.username === key
                ? game.player2.username
                : game.player1.username;
            this.server.to(game.room).emit('gameOver', { winner: winner });
            await this.EndGame(game, winner);
            this.updateMatchs();
          }
        })
      }
    });
  }

  @SubscribeMessage('keypress')
  handleKeyPress(
    @CurrentUser() user: CurrentUserDto,
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string; username: string; key: string },
  ): any {
    try {
      let game = this.Games.get(payload.room);
      if (game) {
        if (game.IsPlayer(user.username)) {
          game.handleKeyPress(user.username, payload.key);
        }
      }
    } catch (e) {

    }
  }

  @SubscribeMessage('watchGame')
  async handleWatchGame(
    @CurrentUser() user: CurrentUserDto,
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    try {
      let game = this.Games.get(payload.room);
      if (game) {
        game.Viewers.push({
          socket: client.id,
          username: user.username,
        });
        client.join(game.room);
        let ret = await this.gameService.watchGame(user.id);
        if (ret != null) {
          this.server.to(client.id).emit("Achievement", [{ title: "Supervisor", desc: "Watched a game" }])
        }
        return true;
      } else return false;
    } catch (e) {

    }
  }

  @SubscribeMessage('inviteFriend')
  async handleInviteFriend(
    @CurrentUser() user: CurrentUserDto,
    @ConnectedSocket() client: any,
    @MessageBody() payload: { username: string },
  ): Promise<any> {
    try {
      let to_invite = this.sockets.get(payload.username);
      if (to_invite && !this.InGame(user.username)) {
        let game = new GamePair();
        let _user = await this.userSevice.getUserByUsername(user.id, user.username);
        let user_2 = await this.userSevice.getUserByUsername(
          user.id,
          payload.username,
        );
        game.player1.username = user.username;
        game.player1.id = _user.id;
        game.player1.socket = client;
        game.player1.avatar = _user.avatar;
        game.player2.avatar = user_2.avatar;
        game.player2.id = user_2.id;
        game.joined_1 = true;
        game.player2.username = payload.username;
        this.GamePairs.set(user.username, game);
        client.to(to_invite).emit('invitedGame', { user: _user });
      }
    } catch (e) {

    }

  }

  @SubscribeMessage('acceptChallenge')
  handeAcceptChallenge(
    @ConnectedSocket() client: any,
    @MessageBody() payload: any,
  ): any {
    try {
      let gamePair = this.GamePairs.get(payload.username);
      let game = new Game(gamePair.player1, gamePair.player2);
      game.player2.socket = client;
      this.Games.set(game.room, game);
      game.PlayersJoinRoom();
      this.server.to(game.room).emit('acceptedChallenge', { room: game.room });
      return;
    } catch (e) {

    }
  }

  @SubscribeMessage('DeclineChallenge')
  handleDeclineChallenge(
    @ConnectedSocket() client: any,
    @MessageBody() payload: { username: string },
  ): any {
    try {
      this.removePlayerGamePair(client, payload.username);
    } catch (e) {

    }
  }

  @SubscribeMessage('leftGame')
  async handleLeftGame(
    @CurrentUser() user: CurrentUserDto,
    @ConnectedSocket() client: any,
    @MessageBody() payload: { room: string },
  ) {
    try {
      let game: Game = this.Games.get(payload.room);
      if (game && game.IsPlayer(user.username)) {
        game.stopGame();
        let winner =
          game.player1.username === user.username
            ? game.player2.username
            : game.player1.username;
        await this.EndGame(game, winner);
        this.server.to(payload.room).emit('gameOver', { winner: winner });
        this.updateMatchs();
      }
      client.leave(payload.room);
    } catch (e) {

    }
  }

  @SubscribeMessage('subscribeToQueue')
  async handleSubscribeToQueue(
    @CurrentUser() user: CurrentUserDto,
    @ConnectedSocket() client: any,
    @MessageBody() payload: any,
  ): Promise<any> {
    try {
      let _user = await this.userSevice.getUserByUsername(user.id, user.username);
      let check = false;
      this.players.map(player => {
      if (player.username === user.username)
          check = true;
      })
      if (!check && !this.InGame(user.username))
      {
        this.players.push(
          new Player(client, user.username, _user.avatar, _user.id),
        );
        if (this.players.length >= 2) {
          let game = new Game(this.players.pop(), this.players.pop());
          this.Games.set(game.room, game);
          game.PlayersJoinRoom();
          this.server
            .to(game.room)
            .emit('GameReady', { room: game.room, game: game.getData() });
        } else return { message: 'waiting' };
      }
    } catch (e) {

    }
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @CurrentUser() user: CurrentUserDto,
    @ConnectedSocket() client: any,
    @MessageBody() payload: any,
  ) {
    this.removePlayerFromQueue(user.username);
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @CurrentUser() user: CurrentUserDto,
    @ConnectedSocket() client: any,
    @MessageBody() payload: { room: string },
  ) {
    try {
      let game = this.Games.get(payload.room);
      let IsPlayer: boolean = false;
      if (
        game) {
        if ((user.username === game.player1.username ||
          user.username === game.player2.username)) {
          IsPlayer = true;
          game.start(
            this.server,
            this.EndGame.bind(this),
            this.updateMatchs.bind(this),
          );
          this.sendCurrentMatch(client);
          this.server.emit('updatedStatus');
          await this.gameService.updateStatus(
            game.player1.username,
            game.player2.username,
            'Playing',
          );
        }
        return { game: game.getData(), IsPlayer: IsPlayer };
      } else return { game: null, IsPlayer: null };
    } catch (e) {

    }
  }

  @SubscribeMessage('currentMatch')
  handleCurrentMatch(
    @ConnectedSocket() client: any,
    @MessageBody() payload: any,
  ): any {
    return this.sendCurrentMatch(client);
  }

  private sendCurrentMatch(client: any): any {
    try {
      let data = [];
      for (const value of this.Games.values()) {
        data.push(value.getPlayingData());
      }
      client.emit('currentMatch', data);
      return data;
    } catch (e) {

    }
  }
  private updateMatchs() {
    let data = [];
    for (const value of this.Games.values()) {
      data.push(value.getPlayingData());
    }
    this.server.emit('currentMatch', data);
  }

  async EndGame(game: Game, winner?: string) {
    try {
      clearInterval(game.loop);
      await this.gameService.updateStatus(
        game.player1.username,
        game.player2.username,
        'online',
      );
      this.server.emit('updatedStatus');
      if (winner != undefined) {
        if (game.player1.username == winner) game.player1.score = 5;
        else game.player2.score = 5;
      }
      let achivment = await this.gameService.createGame(game);

      if (achivment != null && achivment.exist == true) {

        let socket = this.sockets.get(achivment.username);
        this.server.to(socket).emit("Achievement", achivment.list);
      }
      this.Games.delete(game.room);
    } catch (e) {

    }
  }

  removePlayerFromQueue(username: string) {
    try {
      this.players.forEach((player) => {
        if (player.username === username)
          this.players.splice(this.players.indexOf(player), 1);
      });
    } catch (e) {

    }
  }

  removePlayerGamePair(client: Socket, username: string) {
    try {
      this.GamePairs.forEach((game) => {
        let gamePair: GamePair;
        if ((gamePair = game.findPlayer(username)) != null) {
          client
            .to(gamePair.player1.socket.id)
            .emit('declineChallenge', { user: gamePair.player2 });
          this.GamePairs.delete(username);
        }
      });
    } catch (e) {

    }
  }

  InGame(username:string){
    this.Games.forEach(game => {
      if (game.IsPlayer(username))
        return true;
    })
    return false;
  }
}
