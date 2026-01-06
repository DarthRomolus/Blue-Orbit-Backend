import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CelestrackService {
  private readonly BASE_URL = 'https://celestrak.org/NORAD/elements/gp.php';

  async getTleData(group: string = 'active'): Promise<string> {
    const url = `${this.BASE_URL}?GROUP=${group}&FORMAT=tle`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if ((error = axios.AxiosError)) {
        console.error('axios error:', error);
      } else {
        console.error('different error', error);
      }
      return error;
    }
  }
}
