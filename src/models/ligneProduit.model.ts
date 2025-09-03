import {RowDataPacket} from "mysql2"

export default interface LigneProduit extends RowDataPacket {
    id_carte?: number
    id_produit?: number
    quantite?: string
}
