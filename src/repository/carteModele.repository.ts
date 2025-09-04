import dbConnection from "@/repository/db"
import {ResultSetHeader} from "mysql2"
import CarteModele from "@/models/carteModel.model"

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

interface ICarteModeleRepository {
    save(modele: CarteModele): Promise<CarteModele>
    findOneByID(id_modele: number): Promise<CarteModele| undefined>
    findOne(key: DynamicObject): Promise<CarteModele | undefined>
    update(modele: CarteModele): Promise<number>
    find(data: DynamicObject): Promise<CarteModele[]>
    delete(id_modele: number): Promise<number>
}

class CarteModeleRepository implements ICarteModeleRepository {
    save(modele: CarteModele): Promise<CarteModele> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO carte_modele (nom,description,fond_couleur,illustration,police,actif) VALUES(?,?,?,?,?,?)",
                [modele.nom,modele.description,modele.fond_couleur,modele.illustration,modele.police,modele.actif],
                (err, res) => {
                    if (err) reject(err)
                    else this.findOneByID(res.insertId)
                        .then((modele) => resolve(modele))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(id_modele: number): Promise<CarteModele> {
        return new Promise((resolve, reject) => {
            dbConnection.query<CarteModele[]>(
                "SELECT * FROM carte_modele WHERE id_modele = ?",
                [id_modele],
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

    findOne(data: DynamicObject): Promise<CarteModele | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<CarteModele[]>(
                `SELECT * FROM carte_modele WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(modele: CarteModele): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE carte_modele SET nom = ?, description = ?, fond_couleur = ?, illustration = ?, police = ?, actif = ? WHERE id_modele = ?",
                [modele.nom,modele.description,modele.fond_couleur,modele.illustration,modele.police,modele.actif, modele.id_modele],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
    find(data: DynamicObject): Promise<CarteModele[]> {
        let query: string = "SELECT * FROM carte_modele"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if (c.key === 'id_modele' || c.key === 'actif') {
                    partial = `${c.key} = ${c.value}`
                }else if( c.key === 'nom' || c.key === 'illustration') {
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
            dbConnection.query<CarteModele[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }

    delete(id_modele: number): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "DELETE FROM carte_modele WHERE id_modele = ?",
                [id_modele],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
}

export default new CarteModeleRepository()
