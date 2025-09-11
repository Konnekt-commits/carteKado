import {RowDataPacket} from "mysql2"

export default interface CartePersonnalisation extends RowDataPacket {
    id_personnalisation?: number
    id_carte: number
    id_modele: string
    couleur_fond?: string
    illustration?: boolean
    message_perso?: boolean
    police?: string
    autres_options_json?: object
}
