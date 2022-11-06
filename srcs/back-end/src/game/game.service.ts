import { flatten, Injectable } from '@nestjs/common';
import { match } from 'assert';
import { PrismaService } from 'src/prisma/prisma.service';
import { Game } from './dto';

@Injectable()
export class GameService {
  constructor(readonly prisma: PrismaService) { }


  async isAchivmentExist(title, user_id: number) {
    try {
      let ach = await this.prisma.achievements.findFirst({ where: { user_id: user_id, title: title } });
      if (ach != null)
        return true;
      return false;
    } catch (e) {
      return false;
    }
  }



  async createGame(dto: Game) {
    try {
      let prfectSocre = false;
      let rankingChaneg = false;
      let list = [];
      const _const = 0.2;
      let winner =
        dto.player1.score > dto.player2.score ? dto.player1 : dto.player2;
      let loser =
        dto.player1.score < dto.player2.score ? dto.player1 : dto.player2;
      let game = await this.prisma.game.create({
        data: {
          loserId: loser.id,
          winnerId: winner.id,
          loserScore: loser.score,
          winnerScore: winner.score,
        },
      });
      let user = await this.prisma.user.findUnique({ where: { id: winner.id } });

      let user2 = await this.prisma.user.update({
        data: { xp: { increment: 10 }, level: _const * Math.sqrt(user.xp.plus(10).toNumber()) },
        where: { id: winner.id },
      });
      let match = await this.prisma.game.findMany({ where: { winnerId: winner.id }, orderBy: { createdAt: "asc" }, take: 5 });
      let lose = match.filter(x => x.loserId == winner.id);
      if (match.length == 5 && lose.length == 0) {
        let exist = await this.isAchivmentExist("Straight shooter", winner.id)
        if (exist == false) {
          list.push({ user_id: winner.id, title: "Straight shooter", desc: "You've won 5 matches in a row" });
        }
      }
      if (winner.score == 5 && loser.score == 0) {
        let exist = await this.isAchivmentExist("Killer", winner.id)
        if (exist == false) {
          list.push({ user_id: winner.id, title: "Killer", desc: "Perfect score" });
        }
      }
      if (Math.floor(user2.level.toNumber()) != Math.floor(user.level.toNumber())) {
        let obj: any = { title: "" };
        if (Math.floor(user2.level.toNumber()) == 1)
          obj = { user_id: winner.id, title: "Bronze status", desc: "Reached 1st rank" };
        else if (Math.floor(user2.level.toNumber()) == 2)
          obj = { user_id: winner.id, title: "Silver king", desc: "Reached 2nd rank" };
        else if (Math.floor(user2.level.toNumber()) == 3)
          obj = { user_id: winner.id, title: "Golden boy", desc: "Reached 3rd rank" };

        let exist = await this.isAchivmentExist(obj.title, winner.id)

        if (exist == false) {
          list.push(obj);
        }
      }
      if (list.length != 0) {
        await this.prisma.achievements.createMany({ data: list });
        return { exist: true, username: winner.username, list };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async watchGame(userid: number) {
    try {
      let exist = await this.isAchivmentExist("Supervisor", userid)
      if (exist == false) {
        return await this.prisma.achievements.create({ data: { title: "Supervisor", desc: "Watched a game", user_id: userid } });
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async getALlMatchByUserId(username: string) {
    try {
      let user = await this.prisma.user.findUnique({ where: { username: username }, select: { id: true } });
      let matchs = await this.prisma.game.findMany({
        where: {
          OR: [{ winnerId: user.id }, { loserId: user.id }],
        },
        include: {
          winner: {
            select: {
              username: true,
              avatar: true,
            }
          },
          loser: {
            select: {
              username: true,
              avatar: true,
            }
          }
        }
      });


      for (let i = 0; i < matchs.length; i++) {
        if (matchs[i].winner.username == username)
          matchs[i]["IsWinner"] = true
        else
          matchs[i]["IsWinner"] = false;
        if (!matchs[i].winner.avatar.includes("cdn"))
          matchs[i].winner.avatar = process.env.BACK_URL + matchs[i].winner.avatar
        if (!matchs[i].loser.avatar.includes("cdn"))
          matchs[i].loser.avatar = process.env.BACK_URL + matchs[i].loser.avatar
      }
      return matchs;
    } catch (e) {
      return null;
    }
  }
  async rankingByLevel() {
    try {
      let users = await this.prisma.user.findMany({ orderBy: { level: "desc", } });
      users.map(user => {
        delete user.hashRt;
        delete user.Socket_id;
        if (!user.avatar.includes("cdn"))
          user.avatar = process.env.BACK_URL + user.avatar;
        user["_level"] = parseFloat(user.level.toString());
      })
      return users;
    } catch (e) {
      return null;
    }
  }
  async rankingBywinngMatch() {
    try {
      type RankingType = {
        username: string;
        avatre: string;
        winingCount: number;
        lossingCount: number;
      };

      let users = await this.prisma.user.findMany({
        include: {
          winner: true,
          loser: true,
        },
      });
      let list: RankingType[];
      for (let i = 0; i < users.length; i++) {
        list.push({
          avatre: users[i].avatar,
          username: users[i].username,
          lossingCount: users[i].loser.length,
          winingCount: users[i].winner.length,
        });
      }
      list = list.sort((x, y) => (x.winingCount > y.winingCount ? 1 : -1));
      return list;
    } catch (e) {
      return null;
    }
  }

  async updateStatus(username_1: string, username_2: string, status: string) {
    try {
      let updated = await this.prisma.user.updateMany({
        where: {
          OR: [
            { username: username_1 },
            { username: username_2 }
          ]
        },
        data: {
          status: status
        }
      })
    } catch (e) {
      return null;
    }
  }
}
