import axios from "axios"

export const api = "http://localhost:8000/api";
const AxiosAPI=axios.create({
    baseURL:api,
    withCredentials:true,
});

export default AxiosAPI;