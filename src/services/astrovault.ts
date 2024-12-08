import axios from 'axios';
import type { Asset, Farm, Pool } from "~/types/types";

const API_BASE_URL = 'https://ext.astrovault.io';

export const fetchPools = async (): Promise<Pool[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pool`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching pools:', error);
    return [];
  }
};

export const fetchAssets = async (): Promise<Asset[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/asset`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
};

export const fetchFarms = async (): Promise<Farm[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/farm`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching farms:', error);
    return [];
  }
};
