import { ActionProvider, WalletProvider, Network, CreateAction } from "@coinbase/agentkit";
import { GeneratedResponse } from "src/ai/interfaces/ai.interfaces";
import z from "zod";

class CreateBoxActionProvider extends ActionProvider<WalletProvider> {
    constructor() {
        super("create-box-action-provider", []);
    }

    @CreateAction({
        name: "create-box",
        description: "Create a box with youtube url",
        schema: GeneratedResponse,
    })
    async myAction(args: z.infer<typeof GeneratedResponse>): Promise<string> {
        console.log("Create box action", args);
        return args.new_box_info.sound_url ?? "No youtube url found";
    }

    supportsNetwork = (network: Network) => true;
}

export const createBoxActionProvider = () => new CreateBoxActionProvider();

