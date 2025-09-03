import {RowDataPacket} from "mysql2"

export default interface Produit extends RowDataPacket {
    id_produit?: number
    id_entreprise?: number
    nom?: string
    prix_ttc?: number
    actif: boolean
}
