import { ChatroomType, RelationStatus, RoomMemberRole } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class  createRoomDto{

    @IsString()
    @IsNotEmpty()
    name:string;

    @IsNotEmpty()
    type: ChatroomType;

    @IsString()
    password?: string;

    @IsNumber()
    ownerId?: number;

}

export class  UserRoomDto{

    @IsNotEmpty()
    @IsNumber()
    user_id: number

    @IsNotEmpty()
    @IsNumber()
    room_id: number

    role?: RoomMemberRole

    date_unmute?: Date
}

export class relationDto{
    
    @IsNotEmpty()
    @IsNumber()
    addressed_id: number

    @IsNotEmpty()
    status: RelationStatus
}

export class MessageDto{

    @IsNotEmpty()
    @IsNumber()
    room_id: number

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    content: string
}

export class JoinGroup{
    @IsNotEmpty()
    @IsNumber()
    room_id: number

    @IsString()
    password?:string
}