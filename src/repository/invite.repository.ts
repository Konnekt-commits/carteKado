import dbConnection from "@/repository/db"
import {ResultSetHeader} from "mysql2"
import Invite from "@/models/invite.model"

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
interface IInviteRepository {
    save(invite: Invite): Promise<Invite>
    findOneByID(invite_id: number): Promise<Invite | undefined>
    findOne(key: DynamicObject): Promise<Invite | undefined>
    update(invite: Invite): Promise<number>
    find(data: DynamicObject): Promise<Invite[]>
    delete(invite_id: number): Promise<number>
}

class InviteRepository implements IInviteRepository {
    save(invite: Invite): Promise<Invite> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO invite (nom, email) VALUES(?,?)",
                [ invite.nom, invite.email],
                (err, res) => {
                    if (err) reject(err)
                    else this.findOneByID(res.insertId)
                        .then((invite) => resolve(invite))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(invite_id: number): Promise<Invite> {
        return new Promise((resolve, reject) => {
            dbConnection.query<Invite[]>(
                "SELECT * FROM invite WHERE id_invite = ?",
                [invite_id],
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

    findOne(data: DynamicObject): Promise<Invite | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<Invite[]>(
                `SELECT * FROM invite WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(invite: Invite): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE invite SET  nom = ?, email = ? WHERE id_invite = ?",
                [ invite.nom, invite.email, invite.id_invite],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
    find(data: DynamicObject): Promise<Invite[]> {
        let query: string = "SELECT * FROM invite"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if (c.key === 'id_invite') {
                    partial = `${c.key} = ${c.value}`
                }else if( c.key === 'nom' || c.key === 'email') {
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
            dbConnection.query<Invite[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }

    delete(id_invite: number): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "DELETE FROM invite WHERE id_invite = ?",
                [id_invite],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
}

export default new InviteRepository()
