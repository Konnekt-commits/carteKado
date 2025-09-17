import dbConnection from "@/repository/db"
import {ResultSetHeader} from "mysql2"
import Produit from "@/models/produit.model"
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
interface IProduitRepository {
    save(produit: Produit): Promise<Produit>
    findOneByID(id_produit: number): Promise<Produit| undefined>
    findOne(key: DynamicObject): Promise<Produit | undefined>
    update(produit: Produit): Promise<number>
    find(data: DynamicObject): Promise<Produit[]>
    delete(id_produit: number): Promise<number>
    deleteBatch(ids: number[]): Promise<number>
}

class ProduitRepository implements IProduitRepository {
    save(produit: Produit): Promise<Produit> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO produit (id_entreprise, nom, prix_ttc, actif) VALUES(?,?,?,?)",
                [ produit.id_entreprise, produit.nom, produit.prix_ttc, produit.actif],
                (err, res) => {
                    if (err) reject(err)
                    else this.findOneByID(res.insertId)
                        .then((produit) => resolve(produit))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(id_produit: number): Promise<Produit> {
        return new Promise((resolve, reject) => {
            dbConnection.query<Produit[]>(
                "SELECT * FROM produit WHERE id_produit = ?",
                [id_produit],
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

    findOne(data: DynamicObject): Promise<Produit | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<Produit[]>(
                `SELECT * FROM produit WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(produit: Produit): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE produit SET id_entreprise = ?, nom = ?, prix_ttc = ?, actif = ? WHERE id_produit = ?",
                [ produit.id_entreprise, produit.nom, produit.prix_ttc, produit.actif, produit.id_produit],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
    find(data: DynamicObject): Promise<Produit[]> {
        let query: string = "SELECT * FROM produit"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if (c.key === 'id_produit' || c.key === 'id_entreprise'|| c.key === 'actif') {
                    partial = `${c.key} = ${c.value}`
                }else if( c.key === 'nom') {
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
            dbConnection.query<Produit[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }

    delete(id_produit: number): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "DELETE FROM produit WHERE id_produit = ?",
                [id_produit],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }

    deleteBatch(ids: number[]): Promise<number> {
        const query: string = `DELETE FROM produit WHERE id_produit IN (${ids.join(',')});`
        return  new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(query,(err,res) =>{
                if (err) reject(err)
                else resolve(res.affectedRows)
            })
        })
    }
}

export default new ProduitRepository()
