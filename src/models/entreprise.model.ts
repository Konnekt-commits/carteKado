import {RowDataPacket} from "mysql2"

export default interface Entreprise extends RowDataPacket {
    id_entreprise?: number
    raison_sociale?: string
    siren?: string
    adresse_facturation?: string
    tva_intracom?: string
    email_facturation?: string
}
