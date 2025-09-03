import {RowDataPacket} from "mysql2"
import {StatusEmail, TypeDestination} from "@/customTypes"

export default interface Email extends RowDataPacket {
    id_email?: number
    id_carte?: number
    dest_type?: TypeDestination
    dest_email?: string
    template_code?: string
    date_envoi?: Date
    statut?: StatusEmail
}
