import cron from 'node-cron';
import { scrappingUsingApi } from './scrapping-data.js';

const runScheduler = () => {
  cron.schedule('0 * * * *', () => {
    scrappingUsingApi('thelazytitip');
  });

  cron.schedule('5 * * * *', () => {
    scrappingUsingApi('sedapmalam_game');
  });

  cron.schedule('10 * * * *', () => {
    scrappingUsingApi('cappee.gaming');
  });
};

export default runScheduler;
