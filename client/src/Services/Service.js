import axios from "axios"

export default class Service{
    path = isProduction ? "acj.heroesunknown.net:3000/api" : "http://localhost:3000/api"
}