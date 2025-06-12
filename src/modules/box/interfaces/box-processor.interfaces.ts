import { BoxEventProcessType, BoxEventStatusType } from "@prisma/client";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class BoxRegisterProcessDto {

  @IsNotEmpty()
  status: BoxEventStatusType;

  @IsNotEmpty()
  @IsOptional()
  type?: BoxEventProcessType;

  @IsString()
  @IsNotEmpty()
  creator_source: string;

  @IsString()
  @IsNotEmpty()
  creator_inbox_id: string;

  @IsString()
  @IsNotEmpty()
  creator_wallet_address: string;

  @IsString()
  @IsNotEmpty()
  conversation_id: string;

  @IsBoolean()
  @IsOptional()
  is_test?: boolean = false;

  @IsString()
  @IsOptional()
  bot_message?: string;

  @IsString()
  @IsOptional()
  reject_reason?: string;
}