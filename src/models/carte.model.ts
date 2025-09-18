import {RowDataPacket} from "mysql2"
import {Status, TypeValeur} from "@/customTypes"

export default interface Carte extends RowDataPacket {
    id_carte?: number
    id_entreprise?: number
    id_client?: number
    id_invite?: number
    id_user_createur?: number
    code?: string
    message?: string
    type_valeur?: TypeValeur
    montant_initial?: number
    montant_restant?: number
    couleur?: string
    date_emission?: Date
    date_expiration?: Date
    statut: Status
}
