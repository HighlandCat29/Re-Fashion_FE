import axios from "axios";

const customFetch = axios.create({
    baseURL: "https://refashion-fqe8c7bfcgg5h0e7.southeastasia-01.azurewebsites.net/api",
});

export default customFetch;
