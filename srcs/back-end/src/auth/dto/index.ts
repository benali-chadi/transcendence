import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class  AuthDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    avatar: string;

    @IsNotEmpty()
    @IsNumber()
    intra_id: number;
}

export class  CurrentUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsNumber()
    @IsNotEmpty()
    id: number;

}