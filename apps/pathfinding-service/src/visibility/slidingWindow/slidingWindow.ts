 import { TimeWindowScore } from 'src/common/types/timeWindowScore';
 
 export function findBestSlidingWindow(entries: TimeWindowScore[], slots: number): TimeWindowScore {
    if (entries.length < slots) {
      return { startTime: null, coverageScore: 0 };
    }

    let windowSum = 0;
    for (let i = 0; i < slots; i++) {
      windowSum += entries[i].coverageScore;
    }

    let bestStart: Date | null = entries[0].startTime;
    let bestScore: number = windowSum;

    for (let i = 1; i <= entries.length - slots; i++) {//TODO: meaningfull variable name for i
      windowSum = windowSum - entries[i - 1].coverageScore + entries[i + slots - 1].coverageScore;

      if (windowSum > bestScore) {
        bestScore = windowSum;
        bestStart = entries[i].startTime;
      }
    }

    return {
      startTime: bestStart,
      coverageScore: bestScore,
    };
  }