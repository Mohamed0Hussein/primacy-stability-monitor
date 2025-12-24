import axios from "../axios"

export const insertSubstance = (substance: object) => {
    return axios.post("/substances", substance)
}

export const getSubstances = () => {
    return axios.get("/substances")
}
