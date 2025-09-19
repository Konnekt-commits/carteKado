import Carte from "@/models/carte.model"
import {TypeValeur} from "@/customTypes"
import LigneProduitRepository from "@/repository/ligneProduit.repository"
import ProduitRepository from "@/repository/produit.repository"
import ClientRepository from "@/repository/client.repository"
import EntrepriseRepository from "@/repository/entreprise.repository"
import InviteRepository from "@/repository/invite.repository"
import UserRepository from "@/repository/user.repository"

export const getAllProductsByCarteService = async (carte: Carte) => {
    // check type
    if (carte.type_valeur === TypeValeur.MONTANT) return null
    const lignes = await LigneProduitRepository.find({
        id_carte: carte.id_carte ?? 0
    })
    const produits = await Promise.all(
        lignes.map(async (ligne) =>{
            const q = ligne.quantite
            const p = await ProduitRepository.findOneByID(ligne.id_produit)

            return {
                quantite: q,
                produit: p
            }
        })
    )
    return produits
}

export const CarteEnhanceCarteService = async (carte: Carte) => {
    const client = await ClientRepository.findOneByID(carte.id_client ?? 0)
    const entreprise = await EntrepriseRepository.retrieveById(carte.id_entreprise ?? 0)
    const invite = await InviteRepository.findOneByID(carte.id_invite ?? 0)
    const user = await UserRepository.findOneByID(carte.id_user_createur ?? 0)
    delete user.hash_mot_de_passe
    delete carte.id_user_createur
    delete carte.id_invite
    delete carte.id_entreprise
    delete carte.id_client
    return {
        ...carte,
        client,
        invite,
        entreprise,
        user
    }
}
