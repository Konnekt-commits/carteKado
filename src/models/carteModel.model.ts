import {RowDataPacket} from "mysql2"

export default interface CarteModele extends RowDataPacket {
    id_modele?: number
    nom?: string
    description?: string
    fond_couleur?: string
    illustration?: string
    police?: string
    actif?: boolean
}
