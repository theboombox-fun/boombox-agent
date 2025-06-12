export interface ContentTypeId {
    authorityId: string;
    typeId: string;
    versionMajor: number;
    versionMinor: number;
  }
  
  export interface XmtpMessage {
    content: string;
    contentType: ContentTypeId;
    conversationId: string;
    deliveryStatus: 'published' | 'undelivered' | 'failed';
    fallback?: any;
    compression?: any;
    id: string;
    kind: string;
    parameters: {
      encoding: string;
      [key: string]: any;
    };
    senderInboxId: string;
    sentAt: Date;
    sentAtNs: number;
  }