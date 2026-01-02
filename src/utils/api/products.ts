import axios from "../axios"

export const insertProduct = (product: object) => {
    return axios.post("/substances", product)
}

export const getProducts = () => {
    return axios.get("/substances")
}

export const addTestResult = (productId: string, testId: string, results: object) => {
    return axios.post(`/substances/${productId}/tests/${testId}/results`, results)
}
