import {RowDataPacket} from "mysql2"

export default interface Client extends RowDataPacket {
    id_client?: number
    id_entreprise?: number
    email?: string
    nom?: string
    telephone?: string
    Appartement?: string
    code_postal?: string
    ville?: string
    pays?: string
    adresse: string
}
