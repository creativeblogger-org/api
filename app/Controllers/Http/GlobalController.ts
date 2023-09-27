import APIException from 'App/Exceptions/APIException'
import Banner from 'App/Models/Banner'

export default class GlobalController {
    public async banner({ }) {
        const banner = await Banner.query()
        if (!banner) {
            throw new APIException("Il n'y a pas de bannière", 404)
          }
        return banner
    }
}