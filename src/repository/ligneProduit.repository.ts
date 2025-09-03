import dbConnection from "@/repository/db"
import {ResultSetHeader} from "mysql2"
import LigneProduit from "@/models/ligneProduit.model"

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
interface ILigneProduitRepository {
    save(ligneProduit: LigneProduit): Promise<LigneProduit>
    findOneByID(ligne_id: { id_carte: number, id_produit: number }): Promise<LigneProduit| undefined>
    findOne(key: DynamicObject): Promise<LigneProduit | undefined>
    update(ligneProduit: LigneProduit): Promise<number>
    find(data: DynamicObject): Promise<LigneProduit[]>
    delete(ligne_id: { id_carte: number, id_produit: number }): Promise<number>
}

class LigneProduitRepository implements ILigneProduitRepository {
    save(ligneProduit: LigneProduit): Promise<LigneProduit> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO carte_ligne_produit (id_carte, id_produit, quantite) VALUES(?,?,?)",
                [ligneProduit.id_carte, ligneProduit.id_produit, ligneProduit.quantite],
                (err) => {
                    if (err) reject(err)
                    else this.findOneByID({id_carte:ligneProduit.id_carte, id_produit: ligneProduit.id_produit})
                        .then((ligne) => resolve(ligne))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(ligne_id: { id_carte: number, id_produit: number }): Promise<LigneProduit> {
        return new Promise((resolve, reject) => {
            dbConnection.query<LigneProduit[]>(
                "SELECT * FROM carte_ligne_produit WHERE id_carte = ? AND id_produit = ?",
                [ligne_id.id_carte, ligne_id.id_produit],
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

    findOne(data: DynamicObject): Promise<LigneProduit | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<LigneProduit[]>(
                `SELECT * FROM carte_ligne_produit WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(ligneProduit: LigneProduit): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE carte_ligne_produit SET id_carte = ?, id_produit = ?, quantite = ? WHERE id_client = ?",
                [ligneProduit.id_carte, ligneProduit.id_produit, ligneProduit.quantite],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
    find(data: DynamicObject): Promise<LigneProduit[]> {
        let query: string = "SELECT * FROM carte_ligne_produit"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if (c.key === 'id_carte' || c.key === 'id_produit' || c.key === 'quantite') {
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
            dbConnection.query<LigneProduit[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }

    delete(ligne_id: { id_carte: number, id_produit: number }): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "DELETE FROM carte_ligne_produit WHERE id_carte = ? AND id_produit = ?",
                [ligne_id.id_carte, ligne_id.id_produit],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
}

export default new LigneProduitRepository()
