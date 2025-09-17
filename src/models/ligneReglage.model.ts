import {RowDataPacket} from "mysql2"

export default interface LigneReglage extends RowDataPacket {
    id_ligne?: number
    id_reglage: number
    id_produit: number
}
