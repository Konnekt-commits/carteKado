import dbConnection from "@/repository/db"
import {ResultSetHeader} from "mysql2"
import LigneReglage from "@/models/ligneReglage.model";

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
interface ILigneRepositoryRepository {
    save(ligneReglage: LigneReglage): Promise<LigneReglage>
    findOneByID(ligne_id: number): Promise<LigneReglage| undefined>
    findOne(key: DynamicObject): Promise<LigneReglage | undefined>
    update(ligneReglage: LigneReglage): Promise<number>
    find(data: DynamicObject): Promise<LigneReglage[]>
    delete(ligne_id: number): Promise<number>
}

class LigneRepositoryRepository implements ILigneRepositoryRepository {
    save(ligneReglage: LigneReglage): Promise<LigneReglage> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO ligne_reglage_produit (id_reglage, id_produit) VALUES(?,?)",
                [ligneReglage.id_reglage, ligneReglage.id_produit],
                (err, res) => {
                    if (err) reject(err)
                    else this.findOneByID(res.insertId)
                        .then((ligne) => resolve(ligne))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(ligne_id: number): Promise<LigneReglage> {
        return new Promise((resolve, reject) => {
            dbConnection.query<LigneReglage[]>(
                "SELECT * FROM ligne_reglage_produit WHERE id_ligne = ? ",
                [ligne_id],
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

    findOne(data: DynamicObject): Promise<LigneReglage | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<LigneReglage[]>(
                `SELECT * FROM ligne_reglage_produit WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(ligneReglage: LigneReglage): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE ligne_reglage_produit SET id_reglage = ?, id_produit = ? WHERE id_ligne = ?",
                [ligneReglage.id_reglage, ligneReglage.id_produit, ligneReglage.id_ligne],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
    find(data: DynamicObject): Promise<LigneReglage[]> {
        let query: string = "SELECT * FROM ligne_reglage_produit"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if (c.key === 'id_ligne' || c.key === 'id_produit' || c.key === 'id_reglage') {
                    partial = `${c.key} = ${c.value}`
                }
                if (index === 0) {
                    query+= partial
                }else{
                    query+= ` AND ${partial}`
                }
            })
        }
        return new Promise((resolve, reject) => {
            dbConnection.query<LigneReglage[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }

    delete(ligne_id: number): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "DELETE FROM ligne_reglage_produit WHERE id_ligne = ?",
                [ligne_id],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
}

export default new LigneRepositoryRepository()
