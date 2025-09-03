import dbConnection from "@/repository/db"
import User from "@/models/user.model"
import {Roles} from "@/customTypes"
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
interface SearchParam {
    id_user?: number
    id_entreprise?: number
    email?: string
    role?: Roles
    actif?: boolean
    derniere_connexion?: Date
}
interface IUserRepository {
    save(user: User): Promise<User>
    findOneByID(user_id: number): Promise<User| undefined>
    findOne(key: DynamicObject): Promise<User | undefined>
    update(user: User): Promise<number>
    // find(searchParams: SearchParam): Promise<User[]>
}

class UserRepository implements IUserRepository {
    save(user: User): Promise<User> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "INSERT INTO utilisateur (id_entreprise, email, hash_mot_de_passe, role, actif, derniere_connexion) VALUES(?,?,?,?,?,?)",
                [user.id_entreprise, user.email, user.hash_mot_de_passe, user.role, user.actif, user.derniere_connexion],
                (err, res) => {
                    if (err) reject(err)
                    else this.findOneByID(res.insertId)
                        .then((user) => resolve(user))
                        .catch(reject)
                }
            )
        })
    }
    findOneByID(user_id: number): Promise<User> {
        return new Promise((resolve, reject) => {
            dbConnection.query<User[]>(
                "SELECT * FROM utilisateur WHERE id_user = ?",
                [user_id],
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

    findOne(data: DynamicObject): Promise<User | undefined> {
        const q = processDynamicData(data)[0]
        return new Promise((resolve, reject) => {
            dbConnection.query<User[]>(
                `SELECT * FROM utilisateur WHERE ${q.key} = ?`,
                [q.value],
                (err, res) => {
                    if (err) reject(err)
                    else  resolve(res?.[0])
                }
            )
        })
    }

    update(user: User): Promise<number> {
        return new Promise((resolve, reject) => {
            dbConnection.query<ResultSetHeader>(
                "UPDATE utilisateur SET id_entreprise = ?, email = ?, hash_mot_de_passe = ?, role = ?, actif = ?, derniere_connexion = ? WHERE id_user = ?",
                [user.id_entreprise, user.email, user.hash_mot_de_passe, user.role, user.actif, user.derniere_connexion, user.id_user],
                (err, res) => {
                    if (err) reject(err)
                    else resolve(res.affectedRows)
                }
            )
        })
    }
}

export default new UserRepository()
