import {RowDataPacket} from "mysql2"

export default interface Invite extends RowDataPacket {
    id_invite?: number
    nom?: string
    email?: string

}
