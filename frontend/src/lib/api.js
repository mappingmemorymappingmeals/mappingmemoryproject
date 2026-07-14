import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const fetchPlaces = () => axios.get(`${API}/places`).then((r) => r.data);
export const fetchEntries = () => axios.get(`${API}/entries`).then((r) => r.data);
export const fetchEntry = (id) => axios.get(`${API}/entries/${id}`).then((r) => r.data);
export const fetchCommunities = () => axios.get(`${API}/communities`).then((r) => r.data);
export const fetchLayerGuide = () => axios.get(`${API}/meta/layer-guide`).then((r) => r.data);
export const fetchCrossReference = () => axios.get(`${API}/meta/cross-reference`).then((r) => r.data);
export const fetchStats = () => axios.get(`${API}/stats`).then((r) => r.data);

export const aiTour = (entry_id, language, regenerate = false) =>
  axios.post(`${API}/ai/tour`, { entry_id, language, regenerate }, { timeout: 90000 }).then((r) => r.data);

export const aiSnapshot = (ctx) =>
  axios.post(`${API}/ai/snapshot`, ctx, { timeout: 90000 }).then((r) => r.data);

export const aiQuestions = (payload) =>
  axios.post(`${API}/ai/questions`, payload, { timeout: 90000 }).then((r) => r.data);

export const aiTranslate = (text, target) =>
  axios.post(`${API}/ai/translate`, { text, target }, { timeout: 90000 }).then((r) => r.data);
