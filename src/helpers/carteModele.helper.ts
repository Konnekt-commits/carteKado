import ErrorHandler from "@/utils/ErrorHandler"

const colorPattern = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/
export const validateCarteModeleData = (data: any) => {
    const { nom, actif, fond_couleur} = data

    if ( [nom, actif].some(el => el == null) ) {
        throw new ErrorHandler(`name and actif state can not be nullable`, 400)

    }
    if (fond_couleur && !colorPattern.test(fond_couleur)) {
        throw new ErrorHandler('Invalid color format!', 400)
    }

}
