export interface CloudflareImageResponse {
    result: {
        id: string;
        filename: string;
        uploaded: string;
        variants: string[];
    };
    success: boolean;
    errors: any[];
    messages: any[];
}