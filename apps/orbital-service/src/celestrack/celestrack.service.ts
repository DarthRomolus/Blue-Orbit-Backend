import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          `Failed to fetch TLE data for group ${group}`,
          HttpStatus.BAD_GATEWAY,
        );
      }
      throw error;
    }
  }
}
