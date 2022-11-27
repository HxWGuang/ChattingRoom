export enum eMsgType {
    server = 'server',
    chat   = 'chat',
    reply  = 'reply'
}

export interface msgInfo {
    type: eMsgType;
    from: string;
    to?: string;
    content: string;
}

export class msgTool {
     static toJson(type: eMsgType, data: string, from?: string, to?: string): string {
         let msg: msgInfo = {
             type : eMsgType.server,
             content : '',
             from: 'server'
         }

         msg.type = type;
         if (from) {
             msg.from = from;
         }

         switch (type) {
             case eMsgType.chat:
             case eMsgType.server: {
                 break;
             }
             case eMsgType.reply: {
                 msg.to = to;
                 break;
             }
         }
         msg.content = data;

         return JSON.stringify(msg);
     };

     static showMsg(type: eMsgType, content: string, from: string, to?: string): string {
         switch (type) {
             case eMsgType.server: {
                 return `[${type}] ${content}`;
             }
             case eMsgType.chat: {
                 return `[${type}] ${from}> ${content}`;
             }
             case eMsgType.reply: {
                 let str = `[${type}] ${from}>> ${to}\
                 \n----------------------\
                 \n${content}`;
                 return str;
             }
         }
     }
}