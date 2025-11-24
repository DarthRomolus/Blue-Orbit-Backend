import { Injectable } from '@nestjs/common';
import axios, { Axios } from 'axios';

@Injectable()
export class CelestrackService {
  private readonly BASE_URL = 'https://celestrak.org/NORAD/elements/gp.php';

  async getTleData(group: string = 'active'): Promise<string> {
    const url = `${this.BASE_URL}?GROUP=${group}&FORMAT=tle`;
    try {
      const response = await axios.get(url);
      console.log(response.data);
      return response.data;
    } catch (error) {
      if ((error = axios.AxiosError)) {
        console.log('axios error:', error);
      } else {
        console.log('different error', error);
      }
      return error;
    }
  }
}
