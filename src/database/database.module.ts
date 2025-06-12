import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";
import { BoxDatabaseService } from "../modules/box/databases/box.database.service.js";
import { BoxPlaysDatabaseService } from "../modules/box/databases/box_plays.database.service.js";
import { BoxEventDatabaseService } from "../modules/box/databases/box-event.database.service.js";
import { ConversationDatabaseService } from "../modules/conversations/databases/conversation.database.service.js";
@Module({
    providers: [
        DatabaseService,
        BoxDatabaseService,
        BoxPlaysDatabaseService,
        BoxEventDatabaseService,
        ConversationDatabaseService,
    ],
    exports: [
        DatabaseService,
        BoxDatabaseService,
        BoxPlaysDatabaseService,
        BoxEventDatabaseService,
        ConversationDatabaseService,
    ]
})
export class DatabaseModule {}