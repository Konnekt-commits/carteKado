import QRCode from 'qrcode'
import Carte from "@/models/carte.model"
import {Base64, CarteKadoIntentParams, ImageType, QRResult, TypeValeur} from "@/customTypes"
import LigneProduitRepository from "@/repository/ligneProduit.repository"
import ProduitRepository from "@/repository/produit.repository"
import ClientRepository from "@/repository/client.repository"
import EntrepriseRepository from "@/repository/entreprise.repository"
import InviteRepository from "@/repository/invite.repository"
import UserRepository from "@/repository/user.repository"
import LigneProduit from "@/models/ligneProduit.model"

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

export const deleteProductCarteService = async (id_carte: number) => {
    const lines = await LigneProduitRepository.find({
        id_carte: id_carte
    })
    if (lines) {
        await Promise.all(
            lines.map(async (line) => {
                await LigneProduitRepository.delete({id_carte: line.id_carte, id_produit: line.id_produit})
            })
        )
    }
}

interface IProduitBody {
    id_produit: number,
    quantite? : number
}
export const addProductService = async (produits: IProduitBody[], id_carte: number )=> {
    await Promise.all(
        produits.map(async (produit: { id_produit: number, quantite?: number }) =>{
            const lineData = {
                id_carte,
                id_produit: produit.id_produit,
                quantite: produit.quantite ?? 1
            } as LigneProduit
            await LigneProduitRepository.save(lineData)
        })
    )
}

/**
 * Validates the required parameters for generating CarteKado intent.
 * @param {Object} params - The parameters object containing email cleint and invite.
 * @returns {string} - An error message if validation fails, otherwise an empty string.
 * */
function validate<T extends { invite: string, client: string }>({ invite, client }: T): string {
    if (!invite || !client) return "destination  address/name is compulsory"
    return ''
}

export const carteKadoQRService = ({
    id_carte: id,
    invite_email: invite,
    client_email: client,
    montant_initial: am,
    montant_restant: r,
    carte_type: t
                          }: CarteKadoIntentParams,
                          qrOptions?: QRCode.QRCodeToDataURLOptions): Promise<QRResult> => {
 const params: any = Object.assign({invite, client}, Object.fromEntries(Object.entries({id, invite, client, am, r, t}).filter(
     ([_, value]) => value
 )))
    const error = validate(params)
    if (error) return Promise.reject(new Error(error))
    const intent = 'https://api.cartekado.fr/api-docs' + new URLSearchParams(params).toString()

    return new Promise((resolve, reject) => {
        QRCode
            .toDataURL(intent, qrOptions)
            .then((base64Data: string) => resolve({ qr: base64Data as Base64<ImageType>, intent} as QRResult))
            .catch(err => reject(new Error("Unable to generate CarteKado QR Code. \n" + err)))

    })
}
