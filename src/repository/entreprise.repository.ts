import dbConnection from "@/repository/db"
import Entreprise from "@/models/entreprise.model"
import {ResultSetHeader} from "mysql2"

interface IEntrepriseRepository {
    save(entreprise: Entreprise): Promise<Entreprise>
    // retrieveAll(searchParams: { title: string, published: boolean }): Promise<Entreprise[]>
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
}

export default new EntrepriseRepository()
