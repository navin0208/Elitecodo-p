import axios from 'axios';

// export const baseURL = 'http://localhost:8582';
// export const baseURL = 'http://148.72.245.102:8583';
// export const baseURL = 'http://68.178.174.30:8583';
export const baseURL = typeof window !== 'undefined' && window.location.port !== '3001'
  ? window.location.origin
  : 'http://localhost:8583';

// export const baseURL =
//   'https://f141-2409-40c2-1002-f7c-aca1-26bb-b175-def4.ngrok-free.app';
// export const baseURL = 'http://97.74.89.72:5000';
// export const baseURL = 'http://97.74.80.230:5000';

// Create an Axios instance
export const httpClient = axios.create({
  baseURL,
});
