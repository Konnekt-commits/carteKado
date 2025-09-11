import dbConnection from "@/repository/db"
import Entreprise from "@/models/entreprise.model"
import {ResultSetHeader} from "mysql2"


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
interface IEntrepriseRepository {
    save(entreprise: Entreprise): Promise<Entreprise>
    find(data: DynamicObject): Promise<Entreprise[]>
    retrieveById(id_entreprise: number): Promise<Entreprise | undefined>
    retrieveBySiren(siren: string): Promise<Entreprise | undefined>
    // update(entreprise: Entreprise): Promise<number>
    // delete(id_entreprise: number): Promise<number>
    // deleteAll(): Promise<number>
}
// constructeur

class EntrepriseRepository implements IEntrepriseRepository {
    save(entreprise: Entreprise): Promise<Entreprise> {
       return new Promise((resolve, reject) =>{
           dbConnection.query<ResultSetHeader>(
               "INSERT INTO entreprise (raison_sociale, siren, adresse_facturation, tva_intracom, email_facturation) VALUES(?,?,?,?,?)",
               [entreprise.raison_sociale, entreprise.siren, entreprise.adresse_facturation, entreprise.tva_intracom? entreprise.tva_intracom: false, entreprise.email_facturation],
               (err, res) => {
                   if (err) reject(err)
                   else this.retrieveById(res.insertId)
                       .then((entreprise) => resolve(entreprise))
                       .catch(reject)
               }
           )
       })
    }

    retrieveById(id_entreprise: number): Promise<Entreprise> {
        return new Promise((resolve, reject) => {
            dbConnection.query<Entreprise[]>(
                "SELECT * FROM entreprise WHERE id_entreprise = ?",
                [id_entreprise],
                (err,res) =>{
                    if (err) reject(err)
                    else resolve(res?.[0])
                }
            )
        })
    }

    retrieveBySiren(siren: string): Promise<Entreprise> {
        return new Promise((resolve, reject) => {
            dbConnection.query<Entreprise[]>(
                "SELECT * FROM entreprise WHERE siren = ?",
                [siren],
                (err,res) =>{
                    if (err) reject(err)
                    else resolve(res?.[0])
                }
            )
        })
    }
    find(data: DynamicObject): Promise<Entreprise[]> {
        let query: string = "SELECT * FROM entreprise"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if ( c.key === 'id_entreprise'|| c.key === 'actif') {
                    partial = `${c.key} = ${c.value}`
                }else if( c.key === 'siren' || c.key === 'raison_sociale') {
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
            dbConnection.query<Entreprise[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }
}

export default new EntrepriseRepository()
