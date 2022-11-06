import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CurrentUserDto } from 'src/auth/dto';
import { CurrentUser } from 'src/common/decorators';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
    constructor(private gameService: GameService){}

    @Get("Matchs/:username")
    async getMatches(@CurrentUser() user: CurrentUserDto, @Param("username") username: string){
        let matchs = await this.gameService.getALlMatchByUserId(username);
        return matchs;
    }

    @Get("ranking")
    async getRanks(@CurrentUser() user: CurrentUserDto){
        let ranks = await this.gameService.rankingByLevel();
        return ranks;
    }
}
