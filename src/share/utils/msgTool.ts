import {eMsgType, msgBodyStruct} from "./attTypeDefine";

export class msgTool {
     static toJson(type: eMsgType, data: string, stat?: boolean): string;
     static toJson(type: eMsgType, data: string, from?: string, to?: string): string;
     static toJson(type: eMsgType, data: string, expect?: string | boolean, to?: string): string {
         let msg: msgBodyStruct = {
             type : eMsgType.server,
             content : '',
             from: (typeof expect === "string") ? expect : 'server',
             status: ((typeof expect === "string") || (typeof expect === "undefined")) ? true : expect,
         }

         msg.type = type;

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