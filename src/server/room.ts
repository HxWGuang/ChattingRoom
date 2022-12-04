import {hall} from "./hall";
import {eRoomState} from "../share/utils/attTypeDefine";

export class room extends hall{
    readonly roomId: string;
    private _state: eRoomState;

    constructor(roomId:string) {
        super();
        this.roomId = roomId;
        this._state = eRoomState.normal;
    }

    get state() {
        return this._state;
    }
    set state(s) {
        this._state = s;
    }
}