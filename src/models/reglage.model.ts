import {RowDataPacket} from "mysql2"

export default interface Reglage extends RowDataPacket {
    id_reglage?: number
    id_entreprise: number
    nom_boutique?: string
    couleur?: string
    logo?: string
    liste_montants: string
}
