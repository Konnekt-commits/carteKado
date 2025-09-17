import dbConnection from "@/repository/db"
import {ResultSetHeader} from "mysql2"
import Reglage from "@/models/reglage.model";

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
interface IReglageRepository {
    save(reglage: Reglage): Promise<Reglage>
    findOneByID(id_reglage: number): Promise<Reglage| undefined>
    findOne(key: DynamicObject): Promise<Reglage | undefined>
    update(reglage: Reglage): Promise<number>
    find(data: DynamicObject): Promise<Reglage[]>
    delete(id_reglage: number): Promise<number>
}

class ReglageRepository implements IReglageRepository {
    save(reglage: Reglage): Promise<Reglage> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO reglage (id_entreprise, nom_boutique, couleur, logo, liste_montants) VALUES(?,?,?,?,?)",
                [ reglage.id_entreprise, reglage.nom_boutique, reglage.couleur, reglage.logo, reglage.liste_montants],
                (err, res) => {
                    if (err) reject(err)
                    else this.findOneByID(res.insertId)
                        .then((reglage) => resolve(reglage))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(id_reglage: number): Promise<Reglage> {
        return new Promise((resolve, reject) => {
            dbConnection.query<Reglage[]>(
                "SELECT * FROM reglage WHERE id_reglage = ?",
                [id_reglage],
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

    findOne(data: DynamicObject): Promise<Reglage | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<Reglage[]>(
                `SELECT * FROM reglage WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(reglage: Reglage): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE reglage SET id_entreprise = ?, nom_boutique = ?, couleur = ?, logo = ? , liste_montants = ? WHERE id_reglage = ?",
                [ reglage.id_entreprise, reglage.nom_boutique, reglage.couleur, reglage.logo, reglage.liste_montants, reglage.id_reglage],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
    find(data: DynamicObject): Promise<Reglage[]> {
        let query: string = "SELECT * FROM reglage"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if (c.key === 'id_reglage' || c.key === 'id_entreprise') {
                    partial = `${c.key} = ${c.value}`
                }else if( c.key === 'nom_boutique') {
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
            dbConnection.query<Reglage[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }

    delete(id_reglage: number): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "DELETE FROM reglage WHERE id_reglage = ?",
                [id_reglage],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
}

export default new ReglageRepository()
