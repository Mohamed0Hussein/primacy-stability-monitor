import axios from "../axios"

export const insertProduct = (product: object) => {
    return axios.post("/substances", product)
}

export const getProducts = () => {
    return axios.get("/substances")
}
