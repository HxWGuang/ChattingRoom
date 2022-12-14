import {userInfo} from "./userInfo";
import {eGameStat} from "../share/utils/attTypeDefine";

type pm = [string, number];
export class rollGameMgr {
    startTime: number;
    players: Set<userInfo>;
    status: eGameStat;

    constructor() {
        this.startTime = Date.now();
        this.players = new Set<userInfo>();
        this.status = eGameStat.ended;
    }

    startGame(): string {
        this.status = eGameStat.started;
        let arr: pm[] = [];
        for (const player of this.players) {
            arr.push([player.username, Math.floor(Math.random() * 101)]);
        }

        this.status = eGameStat.ended;
        this.players.clear();

        return this.showRes(arr);
    }

    private showRes(arr: pm[]): string {
        let str = 'roll游戏结果：\n';
        arr.forEach((pm) => {
            str += `\t${pm[0]} -> ${pm[1]}\n`;
        })
        return str;
    }
}