import dbConnection from "@/repository/db"
import {ResultSetHeader} from "mysql2"
import Client from "@/models/client.model"

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

interface IClientRepository {
    save(user: Client): Promise<Client>
    findOneByID(client_id: number): Promise<Client| undefined>
    findOne(key: DynamicObject): Promise<Client | undefined>
    update(client: Client): Promise<number>
    find(data: DynamicObject): Promise<Client[]>
    delete(id_client: number): Promise<number>
}

class ClientRepository implements IClientRepository {
    save(client: Client): Promise<Client> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO client (id_entreprise, nom, email, adresse,telephone,Appartement,code_postal, ville, pays) VALUES(?,?,?,?,?,?,?,?,?)",
                [client.id_entreprise, client.nom, client.email, client.adresse, client.telephone, client.Appartement, client.code_postal, client.ville, client.pays],
                (err, res) => {
                    if (err) reject(err)
                    else this.findOneByID(res.insertId)
                        .then((client) => resolve(client))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(client_id: number): Promise<Client> {
        return new Promise((resolve, reject) => {
            dbConnection.query<Client[]>(
                "SELECT * FROM client WHERE id_client = ?",
                [client_id],
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

    findOne(data: DynamicObject): Promise<Client | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<Client[]>(
                `SELECT * FROM client WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(client: Client): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE client SET id_entreprise = ?, nom = ?, email = ?, adresse = ?, telephone = ?, Appartement = ?, code_postal = ?, ville = ?, pays = ? WHERE id_client = ?",
                [client.id_entreprise, client.nom, client.email, client.adresse, client.telephone, client.Appartement, client.code_postal, client.ville, client.pays, client.id_client],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
    find(data: DynamicObject): Promise<Client[]> {
        let query: string = "SELECT * FROM client"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if (c.key === 'id_user' || c.key === 'id_entreprise') {
                    partial = `${c.key} = ${c.value}`
                }else if( c.key === 'nom' || c.key === 'adresse') {
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
            dbConnection.query<Client[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }

    delete(id_client: number): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "DELETE FROM client WHERE id_client = ?",
                [id_client],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
}

export default new ClientRepository()
