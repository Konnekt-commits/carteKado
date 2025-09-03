import {RowDataPacket} from "mysql2"
import {Roles} from "@/customTypes"

export default interface User extends RowDataPacket {
    id_user?: number
    id_entreprise?: number
    email?: string
    hash_mot_de_passe?: string
    role: Roles
    actif: boolean
    derniere_connexion: Date
}
