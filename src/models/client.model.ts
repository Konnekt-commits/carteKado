import {RowDataPacket} from "mysql2"

export default interface Client extends RowDataPacket {
    id_client?: number
    id_entreprise?: number
    email?: string
    nom?: string
    adresse: boolean
}
