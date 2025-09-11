import dbConnection from "@/repository/db"
import {ResultSetHeader} from "mysql2"
import Client from "@/models/client.model"
import CartePersonnalisation from "@/models/cartePersonnalisation.model";

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
interface ICartePersonnalisationRepository {
    save(personnalisation: CartePersonnalisation): Promise<CartePersonnalisation>
    findOneByID(id_personnalisation: number): Promise<CartePersonnalisation| undefined>
    findOne(key: DynamicObject): Promise<CartePersonnalisation | undefined>
    update(personnalisation: CartePersonnalisation): Promise<number>
    find(data: DynamicObject): Promise<CartePersonnalisation[]>
    delete(id_personnalisation: number): Promise<number>
}

class CartePersonnalisationRepository implements ICartePersonnalisationRepository {
    save(personnalisation: CartePersonnalisation): Promise<CartePersonnalisation> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO carte_personnalisation (id_carte, id_modele, couleur_fond, illustration, message_perso, police, autres_options_json) VALUES(?,?,?,?,?,?,?)",
                [personnalisation.id_carte, personnalisation.id_modele, personnalisation.couleur_fond, personnalisation.illustration, personnalisation.message_perso, personnalisation.police, personnalisation.autres_options_json],
                (err, res) => {
                    if (err) reject(err)
                    else this.findOneByID(res.insertId)
                        .then((personnalisation) => resolve(personnalisation))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(id_personnalisation: number): Promise<CartePersonnalisation> {
        return new Promise((resolve, reject) => {
            dbConnection.query<CartePersonnalisation[]>(
                "SELECT * FROM carte_personnalisation WHERE id_personnalisation = ?",
                [id_personnalisation],
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

    findOne(data: DynamicObject): Promise<CartePersonnalisation | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<CartePersonnalisation[]>(
                `SELECT * FROM carte_personnalisation WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(personnalisation: CartePersonnalisation): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE carte_personnalisation SET id_carte = ?, id_modele = ?, couleur_fond = ?, illustration = ?, message_perso = ?, police = ?, autres_options_json = ? WHERE id_personnalisation = ?",
                [personnalisation.id_carte, personnalisation.id_modele, personnalisation.couleur_fond, personnalisation.illustration, personnalisation.message_perso, personnalisation.police, personnalisation.autres_options_json, personnalisation.id_personnalisation],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
    find(data: DynamicObject): Promise<CartePersonnalisation[]> {
        let query: string = "SELECT * FROM carte_personnalisation"

        const q = processDynamicData(data)

        let partial: string = ''
        if (q.length > 0) {
            query += " WHERE "
            q.map((c, index) => {
                if (c.key === 'id_personnalisation' || c.key === 'id_carte' || c.key === 'id_modele') {
                    partial = `${c.key} = ${c.value}`
                }else if( c.key === 'illustration' || c.key === 'message_perso') {
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
            dbConnection.query<CartePersonnalisation[]>(query, (err, res) => {
                if(err) reject(err)
                else resolve(res)
            })
        })

    }

    delete(id_personnalisation: number): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "DELETE FROM carte_personnalisation WHERE id_personnalisation = ?",
                [id_personnalisation],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
}

export default new CartePersonnalisationRepository()
