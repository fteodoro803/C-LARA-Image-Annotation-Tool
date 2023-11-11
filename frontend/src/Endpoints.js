import axios from 'axios';

const Endpoint = axios.create({ baseURL: 'http://localhost:8000/api/' });

export default Endpoint;