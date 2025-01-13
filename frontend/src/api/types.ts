import axios from 'axios';

export type ApiInstance = ReturnType<typeof axios.create>; 