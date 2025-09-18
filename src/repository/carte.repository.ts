import dbConnection from "@/repository/db"
import {ResultSetHeader} from "mysql2"
import Carte from "@/models/carte.model"

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

interface ICarteRepository {
    save(carte: Carte): Promise<Carte>
    findOneByID(id_carte: number): Promise<Carte| undefined>
    findOne(key: DynamicObject): Promise<Carte | undefined>
    update(carte: Carte): Promise<number>
    find(data: DynamicObject): Promise<Carte[]>
    delete(id_carte: number): Promise<number>
}

class CarteRepository implements ICarteRepository {
    save(carte: Carte): Promise<Carte> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO carte_cadeau (id_entreprise,\n" +
                "id_client,\n" +
                "id_invite,\n" +
                "id_user_createur,\n" +
                "code,\n" +
                "message,\n" +
                "type_valeur,\n" +
                "montant_initial,\n" +
                "montant_restant,\n" +
                "couleur,\n" +
                "date_emission,\n" +
                "date_expiration,\n" +
                "statut) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                    carte.id_entreprise,
                    carte.id_client,
                    carte.id_invite,
                    carte.id_user_createur,
                    carte.code,
                    carte.message,
                    carte.type_valeur,
                    carte.montant_initial,
                    carte.montant_restant,
                    carte.couleur,
                    carte.date_emission,
                    carte.date_expiration,
                    carte.statut
                ],
                (err, res) => {
                    if (err) reject(err)
                    else this.findOneByID(res.insertId)
                        .then((carte) => resolve(carte))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(id_carte: number): Promise<Carte> {
        return new Promise((resolve, reject) => {
            dbConnection.query<Carte[]>(
                "SELECT * FROM carte_cadeau WHERE id_carte = ?",
                [id_carte],
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

    findOne(data: DynamicObject): Promise<Carte | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<Carte[]>(
                `SELECT * FROM carte_cadeau WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(carte: Carte): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE carte_cadeau SET id_entreprise = ?, id_client = ?, id_invite = ?, id_user_createur = ?, code = ?, message = ?, type_valeur = ?, montant_initial = ?, montant_restant = ?, couleur = ?, date_emission = ?, date_expiration = ?, statut = ? WHERE id_carte = ?",
                [
                    carte.id_entreprise,
                    carte.id_client,
                    carte.id_invite,
                    carte.id_user_createur,
                    carte.code,
                    carte.message,
                    carte.type_valeur,
                    carte.montant_initial,
                    carte.montant_restant,
                    carte.couleur,
                    carte.date_emission,
                    carte.date_expiration,
                    carte.statut,
                    carte.id_carte
                ],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
    find(data: DynamicObject): Promise<Carte[]> {
        let query: string = "SELECT * FROM carte_cadeau"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if (c.key === 'id_carte' || c.key === 'id_entreprise') {
                    partial = `${c.key} = ${c.value}`
                }else if( c.key === 'code' || c.key === 'couleur' || c.key === 'message') {
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
            dbConnection.query<Carte[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }

    delete(id_carte: number): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "DELETE FROM carte_cadeau WHERE id_carte = ?",
                [id_carte],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
}

export default new CarteRepository()
