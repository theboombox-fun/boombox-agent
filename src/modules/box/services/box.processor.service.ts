import { Injectable, OnModuleInit } from "@nestjs/common";
import { BoxEvent, BoxEventProcessState, BoxEventProcessType, BoxEventStatusType } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { SUCCESS, UNKNOWN_ERROR } from "../../../common/utils/statics.js";
import { XmtpService } from "../../../xmtp/services/xmtp.service.js";
import { BoxEventDatabaseService } from "../databases/box-event.database.service.js";
import { BoxRegisterProcessDto } from "../interfaces/box-processor.interfaces.js";
import { BoxService } from "./box.service.js";

@Injectable()
export class BoxProcessorService implements OnModuleInit {
    constructor(
        private readonly boxEventDatabaseService: BoxEventDatabaseService,
        private readonly boxService: BoxService,
        private readonly xmtpService: XmtpService
    ) { }

    async onModuleInit() {
        this.startAnalyzingLoop();
    }

    async startAnalyzingLoop() {
        while (true) {
            await this.analyzeProcess();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async register(payload: BoxRegisterProcessDto): Promise<string | null> {
        try {
            const processId = uuidv4();
            await this.boxEventDatabaseService.create({
                process_id: processId,
                process_type: payload.type ?? BoxEventProcessType.PLANNED,
                process_state: BoxEventProcessState.ANALYZING_AUDIO,
                status: payload.status,
                reject_reason: null,
                box_id: null,
                bot_message: payload.bot_message,
                creator_inbox_id: payload.creator_inbox_id,
                conversation_id: payload.conversation_id,
                creator_source: payload.creator_source,
                creator_wallet_address: payload.creator_wallet_address,
                is_test: payload.is_test
            });

            return processId;
        } catch (error) {
            console.error("Error registering box process", error);
            return null;
        }
    }

    async analyzeProcess() {
        try {
            const boxEvents = await this.boxEventDatabaseService.findWithProcessTypeAndStatusType(
                BoxEventProcessType.PLANNED,
                BoxEventStatusType.CREATION
            );

            if (boxEvents.length === 0) return;

            console.log("Analyzing", boxEvents.length, "box events");

            for (const boxEvent of boxEvents) {
                console.log("Analyzing box event", boxEvent.conversation_id);
                this.updateProcessStartTime(Number(boxEvent.id), new Date());

                const analyzeResult = await this.boxService.analyzeBox(boxEvent);

                if (!analyzeResult) {
                    console.log("Error analyzing box event", boxEvent.conversation_id);
                    await this.updateProcessState(Number(boxEvent.id), BoxEventProcessState.ERROR);
                    continue;
                }

                this.createProcess(boxEvent, analyzeResult);
            }
        } catch (error) {
            console.error("Error analyzing box events", error);
        }
    }

    async createProcess(boxEvent: BoxEvent, analyzeResult: any) {
        console.log("Creating box", boxEvent.conversation_id);
        const generator = this.boxService.createBox(boxEvent, analyzeResult.buffer, analyzeResult.analyzerResponse, true);

        let processType: BoxEventProcessType = BoxEventProcessType.ANALYZED;
        let error: string | null = null;
        let data: { id: number, ticker: string, contract_address: string, pfp_url: string } | null = null;

        for await (const step of generator) {
            console.log("Box progress:", step);
            const processState = BoxEventProcessState[step.event as keyof typeof BoxEventProcessState];

            this.updateProcessState(Number(boxEvent.id), processState);

            if (processState === BoxEventProcessState.ERROR) {
                error = step.data;
                break;
            }

            if (processState === BoxEventProcessState.BOX_CREATED) {
                data = step.data;
            }
        }

        if (error) {
            console.log("Error creating box", boxEvent.id, error);
            processType = BoxEventProcessType.PLANNED;
        }

        if (data) {
            console.log("Box created for:", boxEvent.conversation_id);
        }

        let botMessage = UNKNOWN_ERROR;
        if (data) {
            let link = "theboombox.fun/";
            botMessage = SUCCESS.replace("%s", link + data.contract_address);
        }

        await this.boxEventDatabaseService.update(Number(boxEvent.id), {
            process_type: processType,
            reject_reason: error,
            box_id: data?.id,
            box_ticker: data?.ticker,
            box_contract_address: data?.contract_address,
            box_pfp_url: data?.pfp_url,
            bot_message: botMessage,
            process_started_at: null
        });
    }

    async messageProcess() {
        const boxEvents = await this.boxEventDatabaseService.findForMessage();

        for (const boxEvent of boxEvents) {

            this.updateProcessStartTime(Number(boxEvent.id), new Date());

            console.log("Sending message box event", boxEvent.conversation_id);

            let processType: BoxEventProcessType = BoxEventProcessType.COMPLETED;
            let rejectReason: string | null = null;

            if(boxEvent.process_state === BoxEventProcessState.ERROR){
                processType = BoxEventProcessType.REJECTED;
                rejectReason = boxEvent.reject_reason;
            }

            try{
                const conversation = await this.xmtpService.getConversation(boxEvent.conversation_id);
                if(!conversation){
                    throw new Error("Conversation not found");
                }
                await this.xmtpService.sendMessage(conversation, boxEvent.bot_message ?? UNKNOWN_ERROR);
            }catch(error){
                console.error("Error sending message", error);
                processType = BoxEventProcessType.REJECTED;
                rejectReason = error.message;
            }

            await this.boxEventDatabaseService.update(
                Number(boxEvent.id),
                {
                    process_type: processType,
                    reject_reason: rejectReason,
                    process_started_at: null
                }
            );
            return;
        }
    }

    updateProcessStartTime(id: number, date: Date) {
        this.boxEventDatabaseService.update(id, {
            process_started_at: date,
        });
    }

    async updateProcessState(id: number, processState: BoxEventProcessState) {
        await this.boxEventDatabaseService.update(id, {
            process_state: processState,
        });
    }

    async getProcess(processId: string): Promise<BoxEvent | null> {
        return await this.boxEventDatabaseService.findByProcessId(processId);
    }
}

