import dbConnection from "@/repository/db"
import {ResultSetHeader} from "mysql2"
import Email from "@/models/email.model"

interface DynamicObject {
    [key: string]: any; // Defines that any string key will have a value of 'any' type
}
const processDynamicData = (data: DynamicObject) => {
    const arrayKeyValue = []
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            arrayKeyValue.push({key:key, value: data[key]})
            // console.log(`Key: ${key}, Value: ${data[key]}`)
        }
    }
    return arrayKeyValue
}

interface IEMAILRepository {
    save(email: Email): Promise<Email>
    findOneByID(id_email: number): Promise<Email| undefined>
    findOne(key: DynamicObject): Promise<Email | undefined>
    update(email: Email): Promise<number>
    find(data: DynamicObject): Promise<Email[]>
    delete(id_email: number): Promise<number>
}

class EmailRepository implements IEMAILRepository {
    save(email: Email): Promise<Email> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO envoi_email (id_carte, dest_type, dest_email, template_code, date_envoi, statut) VALUES(?,?,?,?,?,?)",
                [email.id_carte, email.dest_type, email.dest_email, email.template_code, email.date_envoi, email.statut],
                (err, res) => {
                    if (err) reject(err)
                    else this.findOneByID(res.insertId)
                        .then((email) => resolve(email))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(id_email: number): Promise<Email> {
        return new Promise((resolve, reject) => {
            dbConnection.query<Email[]>(
                "SELECT * FROM envoi_email WHERE id_email = ?",
                [id_email],
                (err,res) =>{
                    if (err) reject(err)
                    else resolve(res?.[0])
                }
            )
        })
    }

    // find(searchParams: SearchParam): Promise<User[]> {
    //     // return null
    // }

    findOne(data: DynamicObject): Promise<Email | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<Email[]>(
                `SELECT * FROM envoi_email WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(email: Email): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE envoi_email SET id_carte = ?, dest_type = ?, dest_email = ?, template_code = ?, date_envoi = ?, statut = ? WHERE id_email = ?",
                [email.id_carte, email.dest_type, email.dest_email, email.template_code, email.date_envoi, email.statut],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
    find(data: DynamicObject): Promise<Email[]> {
        let query: string = "SELECT * FROM envoi_email"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if (c.key === 'id_carte' || c.key === 'statut') {
                    partial = `${c.key} = ${c.value}`
                }else if( c.key === 'dest_email' || c.key === 'adresse') {
                    partial = `LOWER(${c.key}) LIKE '%${c.value}%'`
                }
                if (index === 0) {
                    query+= partial
                }else{
                    query+= ` AND ${partial}`
                }
            })
        }
        return new Promise((resolve, reject) => {
            dbConnection.query<Email[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }

    delete(id_email: number): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "DELETE FROM envoi_email WHERE id_email = ?",
                [id_email],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
}

export default new EmailRepository()
